export default interface IBusinessInterface{
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
  status: string
  latitude?: number
  longitude?: number
}