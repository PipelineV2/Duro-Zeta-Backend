import IQueueInterface from "./queue.interface"
export default interface IBusinessInterface{
  id?: string
  name: string,
  logo: string,
  description: string,
  location: {
    address: string,
    latitude: number,
    longitude: number
  },
  adminId?: string,
  createdAt?: Date
  verified?: boolean
  status: string,
  queue?: IQueueInterface
}