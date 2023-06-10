export default interface IQueueInterface{
  id?: string
  qrcode: string,
  businessId: string
  members: string[],
  createdAt: Date,
  duration: Date,
  status: "closed" | "open"
}

export interface JoinQueueResponse {
  queue: IQueueInterface,
  position: number
  message: string
}