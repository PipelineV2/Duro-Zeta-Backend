export default interface IQueueInterface{
  id?: string
  qrcode: string,
  members: string[],
  createdAt: Date,
  duration: Date,
  status: "closed" | "open"
}