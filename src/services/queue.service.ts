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
