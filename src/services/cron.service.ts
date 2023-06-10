import { CronJob } from "cron";
import queueModel from "../models/queue.model";
import queueService from "./queue.service";

const cronTimes = {
  everyTwoMinutes: "*/2 * * * *",
  everyTwoSeconds: "*/2 * * * * *",
  everyFiveMinutes: "*/5 * * * *",
  everyOneMinute: "*/1 * * * *",
  everyOneHour: "0 * * * *", // every one hour
  everyTwoHours: "0 */2 * * *",
}


const updateQueueStatus = async (): Promise<void> => {
  const cronJob = new CronJob(cronTimes.everyFiveMinutes, async () => {
    const queues = await queueModel.find({status: "open"}) as any[];
    if(queues.length) {
      for(const queue of queues) {
        const queueElapsed = queueService.queueTimeElapsed(queue.endsAt);
        if(queueElapsed) {
          await queueService.closeQueue(queue._id)
        }
      }
    }
  })
  cronJob.start()
}


export {
  updateQueueStatus,
}