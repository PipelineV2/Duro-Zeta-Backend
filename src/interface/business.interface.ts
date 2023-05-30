export default interface IBusinessInterface{
  name: string,
  logo: string,
  description: string,
  location: string,
  adminId?: string,
  createdAt?: Date
  verified?: boolean
  status: string
  latitude?: number
  longitude?: number
}