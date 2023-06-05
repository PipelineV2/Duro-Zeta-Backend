import Queue from '../models/queue.model';
import IQueueInterface, {
  JoinQueueResponse,
} from '../interface/queue.interface';
import { calculateDistance } from '@/utils/geofence';
import { generateCoordinates } from '@/utils/generateCoordinates';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const requestIp = require('request-ip');
import Business from '../models/business.model';
import { IRequest } from '@/interface/IRequest.interface';
import { Server, Socket } from 'socket.io';
import userModel from '@/models/user.model';

export default class queueService {
  static async createQueue(
    businessId: string,
    qrCode: string,
    howLong?: number
  ): Promise<IQueueInterface> {
    try {
      const existingQueue = (await Queue.findOne({ businessId })) as any;
      if (!existingQueue) {
        const date = new Date();
        let setDuration = howLong || 8;
        setDuration = date.setHours(date.getHours() + setDuration);
        const duration = new Date(setDuration);
        const queueData = {
          businessId,
          qrcode: qrCode,
          duration,
        };
        const queue = (await Queue.create(queueData)) as any;
        return queue;
      } else if (existingQueue.status === 'open') {
        throw Error('you already have an ongoing queue');
      } else {
        await Queue.findOneAndDelete(existingQueue._id);
        throw Error('please try generating a qr code again');
      }
    } catch (error) {
      throw error;
    }
  }

  static async joinQueue(
    userId: string,
    queueId: string,
    req: IRequest
  ): Promise<JoinQueueResponse> {
    try {
      // Check if the queue exists and is open
      const queue = (await Queue.findById(queueId)) as any;

      if (queue && queue.status === 'open') {
        // Check if the user is already in the queue
        const existingUser = (await queue.members.find(
          (user: any) => user.userId.toString() === userId.toString()
        )) as any;

        if (existingUser) {
          throw new Error('You are already in the queue');
        }

        const user = (await userModel.findById(userId)) as any;

        // find business
        const business = (await Business.findById(queue.businessId)) as any;

        if (!business) {
          throw new Error('Business not found');
        }

        const businessCoordinates = {
          latitude: business.location.latitude,
          longitude: business.location.longitude,
        };

        // check if the user is within the fence
        const ip = requestIp.getClientIp(req);
        const coordinates = await generateCoordinates(ip);

        const usersCoordinates = {
          latitude: coordinates.lat,
          longitude: coordinates.lon,
        };

        const distance = calculateDistance(
          usersCoordinates,
          businessCoordinates
        );

        const radius = 0.5; // 500 meters

        if (distance <= radius) {
          console.log('User is within the geofence. Access granted.');
          // Create a new queue user entry
          const updatedQueue = await Queue.updateOne(
            { _id: queueId },
            {
              $push: {
                users: {
                  userId,
                  name: user.name,
                  position: queue.users.length + 1,
                },
              },
            }
          );

          console.log('updated queue =>', updatedQueue);

          return {
            message: `You have been added to the queue, your position is ${
              queue.users.length + 1
            }`,
            // queue: updatedQueue,
            position: queue.users.length + 1,
          };
        } else {
          throw new Error('Access denied. Move closer to the business.');
        }
      } else {
        throw new Error('The queue is not open or does not exist');
      }
    } catch (error) {
      throw error;
    }
  }

  public static setup(io: Server): void {
    io.on('connection', (socket: Socket) => {
      socket.on(
        'userAttended',
        async (userId: string, queueId: string, req: IRequest) => {
          try {
            await this.attendUser(userId, queueId, req);

            io.emit('queueUpdated', this.getQueue(queueId));
          } catch (error) {
            socket.emit('attendUserError', error.message);
            throw error;
          }
        }
      );

      socket.on(
        'locationUpdate',
        (
          userId: string,
          coordinates: { lat: number; lon: number },
          queueId: string
        ) => {
          // Check if the user is outside the geofence
          const isOutsideGeofence = !this.isInsideGeofence(
            coordinates,
            queueId
          ); // true or false

          if (isOutsideGeofence) {
            try {
              // Remove the user from the queue
              this.removeUserFromQueue(userId, queueId);

              // Emit the updated queue to all connected clients
              io.emit('queueUpdated', this.getQueue(queueId));
            } catch (error) {
              console.error(error);
              socket.emit('userLeftGeofenceError', error.message);
            }
          }
        }
      );

      socket.on('userExitedQueue', (userId: string, queueId: string) => {
        try {
          this.removeUserFromQueue(userId, queueId);
          io.emit('queueUpdated', this.getQueue(queueId));
        } catch (error) {
          console.error(error);
          socket.emit('userExitedQueueError', error.message);
        }
      });
    });
  }

  static async attendUser(
    userId: string,
    queueId: string,
    req: IRequest
  ): Promise<any> {
    try {
      const { id } = req.decoded;
      const admin = (await userModel.findById(id)) as any;

      const isAdmin = admin.role === 'admin';

      if (!isAdmin) {
        throw new Error('You are not authorized to perform this action');
      }

      const queue = (await Queue.findById(queueId)) as any;

      if (!queue) {
        throw new Error('No current queue found');
      }

      if (queue.status !== 'open') {
        throw new Error('No open queue found');
      }

      // Check if the user is already in the queue
      const existingUser = (await queue.members.find(
        (user: any) => user.userId.toString() === userId.toString()
      )) as any;

      if (!existingUser) {
        throw new Error('User not found in queue');
      }

      // attend user by removing them from the queue
      const updatedQueue = await Queue.updateOne(
        { _id: queueId },
        {
          $pull: {
            members: {
              userId,
            },
          },
        }
      );

      return {
        message: 'User attended',
        queue: updatedQueue,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getQueue(queueId: string): Promise<any> {
    try {
      const queue = (await Queue.findById(queueId)) as any;

      if (!queue) {
        throw new Error('Queue not found');
      }

      return queue;
    } catch (error) {
      throw error;
    }
  }

  static async isInsideGeofence(
    coordinates: { lat: number; lon: number },
    queueId: string
  ): Promise<boolean> {
    const queue = (await Queue.findById(queueId)) as any;

    const business = (await Business.findById(queue.businessId)) as any;

    if (!business) {
      throw new Error('Business not found');
    }

    const businessCoordinates = {
      latitude: business.location.latitude,
      longitude: business.location.longitude,
    };
    const usersCoordinates = {
      latitude: coordinates.lat,
      longitude: coordinates.lon,
    };

    const distance = calculateDistance(usersCoordinates, businessCoordinates);

    const radius = 0.5; // 500 meters

    if (distance <= radius) {
      return true;
    } else {
      return false;
    }
  }

  static async removeUserFromQueue(
    userId: string,
    queueId: string
  ): Promise<void> {
    const queue = (await Queue.findById(queueId)) as any;

    if (!queue) {
      throw new Error('Queue not found');
    }

    await Queue.updateOne(
      { _id: queueId },
      {
        $pull: {
          members: {
            userId,
          },
        },
      }
    );

    return;
  }
}

/**
 * create service
 * joinQueue service
 * leaveQueue service -websocket needed
 * updateQueue service -websocket needed
 * timer service *
 *
 *
 *
 * ***/
