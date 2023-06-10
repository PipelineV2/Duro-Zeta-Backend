import QRCode from 'qrcode';
/* eslint-disable @typescript-eslint/no-var-requires */
import IBusinessInterface from '../interface/business.interface';
import userServices from './user.service';
import Business from '../models/business.model';
import {
  generateCoordinates,
  reverseGeocode,
} from '../utils/generateCoordinates';
import { IRequest } from '../interface/IRequest.interface';
const requestIp = require('request-ip');
import queueService from './queue.service';
import IQueueInterface from '../interface/queue.interface';

const { isAdmin, findUserById } = userServices;
const { createQueue } = queueService;
// const apiBaseUrl = process.env.BASE_URL
const webUrl = process.env.WEB_BASEURL;

export default class businessService {
  static async createBusiness(
    userId: string,
    businessData: IBusinessInterface,
    req: IRequest
  ): Promise<IBusinessInterface> {
    try {
      const adminUser = await isAdmin(userId);
      if (adminUser) {
      // generate coordinates
      const ip = requestIp.getClientIp(req);
      const coordinates = await generateCoordinates(ip);
      // generate address
      const address = await reverseGeocode(coordinates.lat, coordinates.lon);

      // create business
      businessData.adminId = userId;
      businessData.location = {
        address: address[0].formattedAddress,
        latitude: coordinates.lat,
        longitude: coordinates.lon,
      };
      const newBusiness = (await Business.create(businessData)) as any;
      return {
        adminId: newBusiness.adminId,
        name: newBusiness.name,
        logo: newBusiness.logo,
        description: newBusiness.description,
        verified: newBusiness.verified,
        status: newBusiness.status,
        location: {
          address: businessData.location.address,
          latitude: businessData.location.latitude,
          longitude: businessData.location.longitude,
        },
      };
      } else {
        throw Error("sorry, you can't create a business");
      }
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }


  static async getBusinessData(
    businessId: string
  ): Promise<IBusinessInterface> {
    try {
      const business = (await Business.findById(businessId)) as any;
      if (business) {
        return {
          id: business._id,
          adminId: business.adminId,
          name: business.name,
          logo: business.logo,
          description: business.description,
          location: {
            address: business.location.address,
            latitude: business.location.latitude,
            longitude: business.location.longitude,
          },
          verified: business.verified,
          status: business.status,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  static async updateBusiness(
    userId: string,
    businessId: string,
    updateData: Partial<IBusinessInterface>
  ): Promise<IBusinessInterface> {
    try {
      const adminUser = isAdmin(userId);
      if (adminUser) {
        const business = (await Business.findById(businessId)) as any;
        if (business && business.adminId.toString() === userId.toString()) {
          if (updateData.description) {
            updateData.verified = true;
            updateData.status = 'active';
          }
          await Business.findByIdAndUpdate(businessId, { ...updateData });
          return Business.findById(businessId);
        }
      } else {
        throw Error("sorry, you can't edit a business info");
      }
    } catch (error) {
      throw error;
    }
  }

  static async qRCodeGenerator(
    businessId: string,
    adminId: string,
    howLong?: number
  ): Promise<IQueueInterface> {
    try {
      const adminUser = isAdmin(adminId);
      if (adminUser) {
        const url = `${webUrl}/login?business=${businessId}`;
        const qrCode = await QRCode.toDataURL(url);
        // create queue
        const queue = await createQueue(businessId, qrCode, howLong);
        return queue as IQueueInterface;
      } else {
        throw Error("sorry, you can't perform this action");
      }
    } catch (error) {
      throw error;
    }
  }

  static async verifyBusiness(
    userId: string,
    businessId: string
  ): Promise<boolean> {
    try {
      const user = await findUserById(userId);
      if (user && user.role === 'client') {
        const business = await this.getBusinessData(businessId);
        if (business && business.verified) {
          return true;
        } else {
          return false;
        }
      } else {
        throw Error("you can't take this action");
      }
    } catch (error) {
      throw error;
    }
  }
}
