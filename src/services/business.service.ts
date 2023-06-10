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
import { calculateDistance } from '../utils/geofence';

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

  static async findBusinessesCloseToUser(
    userId: string,
    req: IRequest
  ): Promise<any> {
    try {
      const user = await userServices.findUserById(userId);

      if (!user) {
        throw new Error('user not found');
      }

      const ip = requestIp.getClientIp(req);
      const coordinates = await generateCoordinates(ip);

      const usersCoordinates = {
        latitude: coordinates.lat,
        longitude: coordinates.lon,
      };

      //get all businesses where the status is active and verified is true
      const businesses = await Business.find(
        { verified: true },
        {
          _id: 1,
          name: 1,
          logo: 1,
          description: 1,
          'location.latitude': 1,
          'location.longitude': 1,
        }
      );

      const businessesCoordinates = businesses
        .filter((business: any) => {
          return business.location.latitude && business.location.longitude;
        })
        .map((business: any) => {
          return {
            latitude: business.location.latitude,
            longitude: business.location.longitude,
          };
        });

      // calculate distance between user and each business
      const distances = businessesCoordinates.map((businessCoordinates) => {
        return calculateDistance(usersCoordinates, businessCoordinates);
      });

      // return businesses within 500 meters
      const radius = 0.5; // 500 meters
      const closeBusinesses = distances
        .filter((distance) => distance <= radius)
        .map((distance) => {
          return businesses[distances.indexOf(distance)];
        });

      if (closeBusinesses.length < 0) {
        throw new Error('No business found close to you');
      }
      return {
        message: 'businesses close to you',
        data: closeBusinesses,
        status: 'success',
      };
    } catch (error) {
      throw Error(error.message);
    }
  }

  // search for businesses by name
  static async searchBusinessesByName(
    name: string
  ): Promise<IBusinessInterface[]> {
    try {
      const businesses = (await Business.find({
        name: { $regex: name, $options: 'i' },
      })) as any;
      if (businesses.length < 1) {
        throw new Error('No business found');
      }
      return businesses;
    } catch (error) {
      throw Error(error.message);
    }
  }
}
