import { Request, Response } from 'express';
import businessService from '../services/business.service';
import { IRequest } from '../interface/IRequest.interface';

const { createBusiness, getBusinessData, updateBusiness } = businessService;

export default class businessController {
  static async createNewBusiness(req: IRequest, res: Response): Promise<any> {
    try {
      const { id } = req.decoded;
      const userId = id;
      const data = req.body;
      const newBusiness = await createBusiness(userId, data, req);
      if (newBusiness) {
        return res.status(201).json({
          message: 'business created successfully!',
          data: newBusiness,
        });
      }
    } catch (error) {
      res.status(403).json({
        error: error.message,
      });
    }
  }

  static async updateBusiness(req: IRequest, res: Response): Promise<any> {
    try {
      const { id } = req.decoded;
      const { businessId } = req.params;
      const userId = id;
      const data = req.body;
      const updatedBusiness = await updateBusiness(userId, businessId, data);
      if (updatedBusiness) {
        return res.status(200).json({
          message: 'business data updated',
          data: updatedBusiness,
        });
      }
    } catch (error) {
      res.status(403).json({
        error: error.message,
      });
    }
  }

  static async getBusiness(req: Request, res: Response): Promise<any> {
    try {
      const { businessId } = req.params;
      const business = await getBusinessData(businessId);
      return res.status(200).json({
        message: 'business data received',
        data: business,
      });
    } catch (error) {
      res.status(40).json({
        error: 'error.messagnot found',
      });
    }
  }
}
