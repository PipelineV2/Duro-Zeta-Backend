import { IRequest } from '../interface/IRequest.interface';
import { Server, Socket } from 'socket.io';
// import { attendUser, getQueue, isInsideGeofence } from '../services/queue.service';
import queueService from '../services/queue.service';

export const setupSocket = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log('socket id', socket.id)
    socket.on(
      'userAttended',
      async (userId: string, queueId: string, req: IRequest) => {
        try {
          await queueService.attendUser(userId, queueId, req);
          io.emit('queueUpdated', queueService.getQueue(queueId));
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
        const isOutsideGeofence = !queueService.isInsideGeofence(
          coordinates,
          queueId
        );

        if (isOutsideGeofence) {
          try {
            queueService.removeUserFromQueue(userId, queueId);
            io.emit('queueUpdated', queueService.getQueue(queueId));
          } catch (error) {
            console.error(error);
            socket.emit('userLeftGeofenceError', error.message);
          }
        }
      }
    );

    socket.on('userExitedQueue', (userId: string, queueId: string) => {
      try {
        queueService.removeUserFromQueue(userId, queueId);
        io.emit('queueUpdated', queueService.getQueue(queueId));
      } catch (error) {
        console.error(error);
        socket.emit('userExitedQueueError', error.message);
      }
    });
  });
};
