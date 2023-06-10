import Queue from '../models/queue.model';
import IQueueInterface, {
  JoinQueueResponse,
} from '../interface/queue.interface';
import { calculateDistance } from '../utils/geofence';
import { generateCoordinates } from '../utils/generateCoordinates';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const requestIp = require('request-ip');
import Business from '../models/business.model';
import { IRequest } from '../interface/IRequest.interface';
import userModel from '../models/user.model';


export default class queueService {
  static async createQueue(businessId: string, qrCode: string, duration?: number): Promise<IQueueInterface> {
    try {
      const existingQueue = (await Queue.findOne({ businessId })) as any;
      if (!existingQueue) {
        const date = new Date();
        const setDuration = duration || 8;
        const setEndTime = date.setHours(date.getHours() + setDuration);
        const endsAt = new Date(setEndTime);
        const queueData = {
          businessId,
          qrcode: qrCode,
          endsAt,
        };
        const queue = await Queue.create(queueData) as any;
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

  static async joinQueue(userId: string, businessId: string, req: IRequest): Promise<JoinQueueResponse> {
    try {
      // Check if the queue exists and is open
      const queue = await Queue.findOne({businessId}) as any;

      if (queue && queue.status === 'open') {
        // Check if the user is already in the queue
        const existingUser = await queue.members.find((item: string) => item.toString() === userId.toString()) as any;

        if (existingUser) {
          throw new Error('You are already in the queue');
        }

        // find business
        const business = await Business.findById(businessId) as any;

        if (!business) {
          throw new Error('business not found');
        }

        const businessCoordinates = {
          latitude: business.location.latitude,
          longitude: business.location.longitude,
        };

        // check if the user is within the fence
        const ip = await requestIp.getClientIp(req);
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
          const addUserToQueue = await this.addUserToQueue(userId, queue._id)
          return {
            message: `You have been added to the queue, your position is ${addUserToQueue.members.length}`,
            position: addUserToQueue.members.length,
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

  static async addUserToQueue(userId: string, queueId: string): Promise<IQueueInterface> {
    try {
      const queue = await this.getQueue(queueId)

      let members: string[] = [];
      if(queue.members.length) {
        members = [...members, userId]
      } else {
        members = [userId]
      }
      const updatedQueue = await Queue.findByIdAndUpdate( { _id: queueId }, { members }, { new: true }) as IQueueInterface;
      return updatedQueue
    } catch (error) {
      throw error
    }
  }

  static async removeUserFromQueue( userId: string, queueId: string ): Promise<IQueueInterface> {
    try {
      const queue = await this.getQueue(queueId);
      if (!queue) {
        throw new Error('Queue not found');
      }
      let members = queue.members
      members = members.filter(item => item !== userId);
      return Queue.findByIdAndUpdate( { _id: queueId }, { members }, {new: true} );
    } catch (error) {
      throw error
    }
  }

  static async closeQueue(queueId: string): Promise<void> {
    await Queue.findByIdAndUpdate({_id: queueId}, {status: "closed"});
  }

  static async attendUser(userId: string, queueId: string, req: IRequest): Promise<any> {
    try {
      const { id } = req.decoded;
      const admin = await userModel.findById(id) as any;

      const isAdmin = admin.role === 'admin';

      if (!isAdmin) {
        throw new Error('You are not authorized to perform this action');
      }

      const queue = await this.getQueue(queueId);

      if (!queue) {
        throw new Error('No current queue found');
      }

      if (queue.status !== 'open') {
        throw new Error('No open queue found');
      }

      // Check if the user is already in the queue
      const existingUser = queue.members.find((user: string) => user.toString() === userId.toString()) as any;

      if (!existingUser) {
        throw new Error('User not found in queue');
      }

      // attend user by removing them from the queue
      const updatedQueue = await this.removeUserFromQueue(userId, queueId)
      return {
        message: 'User attended',
        queue: updatedQueue,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getQueue(queueId: string): Promise<IQueueInterface> {
    try {
      let queue = await Queue.findById(queueId) as any;
      queue = {
        id: queue._id,
        ...queue
      };
      delete queue._id
      const queueData = queue as IQueueInterface
      if (!queueData) {
        throw new Error('Queue not found');
      }
      return queueData;
    } catch (error) {
      throw error;
    }
  }

  static async isInsideGeofence(coordinates: { lat: number; lon: number }, queueId: string): Promise<boolean> {
    const queue = await this.getQueue(queueId) as IQueueInterface;

    const business = await Business.findById(queue.businessId) as any;

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

  static queueTimeElapsed(endsAt: Date ): boolean {
    const date = new Date();
    const hour = date.getHours()
    const endTime = endsAt.getHours()
    if(endTime === hour) {
      return true
    } else {
      return false
    }
  }

  static async queueMemberPosition(userId: string, members: string[]): Promise<number> {
    try {
      const userIndex = members.findIndex(item => item.toString() === userId.toString());
      const userPosition = userIndex + 1;
      return userPosition
    } catch (error) {
      throw error
    }
  }

  static async getQueueMembers(queue: IQueueInterface): Promise<{ id: string; userId: string; }[]> {
    try {
      const members = queue.members;
      const membersArr = members.map(data => {
        return {
          id: queue.id,
          userId: data
        }
      });
      return membersArr
    } catch (error) {
      throw error
    }
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
