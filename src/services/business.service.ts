import IBusinessInterface from "../interface/business.interface";
import userServices from "./user.service";
import Business from "../models/business.model"


const {isAdmin} = userServices
export default class businessService {

  static async createBusiness(userId: string, businessData: IBusinessInterface): Promise<IBusinessInterface> {
    const adminUser = await isAdmin(userId)
    if(adminUser) {
      // create business
      businessData.adminId = userId
      const newBusiness = await Business.create(businessData) as any;
      return {
        adminId: newBusiness.adminId,
        name: newBusiness.name,
        logo: newBusiness.logo,
        description: newBusiness.description,
        location: newBusiness.location,
        verified: newBusiness.verified,
        status: newBusiness.status
      }
    } else {
      throw Error("sorry, you can't create a business")
    }
  }

  static async getBusinessData(businessId: string): Promise<IBusinessInterface> {
    try {
      const business = await Business.findById(businessId) as any
      if(business) {
        return {
          adminId: business.adminId,
          name: business.name,
          logo: business.logo,
          description: business.description,
          location: business.location,
          verified: business.verified,
          status: business.status
        }
      }
    } catch (error) {
      throw Error(error)
    }
  }

  static async updateBusiness(userId: string, businessId: string, updateData: Partial<IBusinessInterface>): Promise<IBusinessInterface> {
    try {
      const adminUser = isAdmin(userId);
      if(adminUser) {
        const business = await Business.findById(businessId) as any;
        if(business) {
          if(updateData.description && updateData.location) {
            updateData.verified = true;
            updateData.status = "active"
          }
          await Business.findByIdAndUpdate(businessId, {...updateData});
          return Business.findById(businessId)
        }
      } else {
        throw Error("sorry, you can't edit a business info")
      }
      
    } catch (error) {
      throw Error(error)
    }
  }
}