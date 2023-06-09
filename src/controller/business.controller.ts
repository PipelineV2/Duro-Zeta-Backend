import { Request, Response } from 'express';
import businessService from '../services/business.service';
import { IRequest } from '../interface/IRequest.interface';

const { createBusiness, getBusinessData, updateBusiness, qRCodeGenerator } =
  businessService;
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
      return res.status(403).json({
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
      return res.status(403).json({
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
      res.status(400).json({
        message: 'not found',
      });
    }
  }

  static async generateQRCode(req: IRequest, res: Response): Promise<any> {
    try {
      const { id } = req.decoded;
      const { businessId } = req.params;
      const qrCode = await qRCodeGenerator(businessId, id);
      return res.status(200).json({
        message: 'Qrcode generated successfully',
        data: qrCode,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
}
