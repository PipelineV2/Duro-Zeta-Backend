import Queue from "../models/queue.model"
import IQueueInterface from "../interface/queue.interface";

export default class queueService {
  static async createQueue(businessId: string, qrCode: string, howLong?: number): Promise<IQueueInterface> {
    try {
      const existingQueue = await Queue.findOne({businessId}) as any;
      if(!existingQueue) {
      const date = new Date
        let setDuration = howLong || 8
        setDuration = date.setHours(date.getHours() + setDuration)
        const duration = new Date(setDuration)
        const queueData = {
          businessId,
          qrcode: qrCode,
          duration
        }
        const queue = await Queue.create(queueData) as any
        return queue
      } else if(existingQueue.status === "open") {
        throw Error("you already have an ongoing queue")
      } else {
        await Queue.findOneAndDelete(existingQueue._id)
        throw Error("please try generating a qr code again")
      }
    } catch (error) {
      throw error
    }
  }

  static async joinQueue(userId: string, queueId: string): Promise<IQueueInterface> {
    try {
      // Check if the queue exists and is open
      const queue = await Queue.findById(queueId) as any;
      if (queue && queue.status === "open") {
        // Check if the user is already in the queue
        const existingUser = await queue.users.find(
          (user: any) => user.userId.toString() === userId.toString()
        ) as any;
        if (existingUser) {
          throw new Error("You are already in the queue");
        }

        // check if the user is within the fence
        
  
        // Create a new queue user entry
        const updatedQueue = await Queue.updateOne(
          { _id: queueId },
          {
            $push: {
              users: {
                userId,
                position: queue.users.length + 1,
              },
            },
          }
        )

        console.log("updated queue =>", updatedQueue)
  
        return updatedQueue;
      } else {
        throw new Error("The queue is not open or does not exist");
      }
    } catch (error) {
      throw error;
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
