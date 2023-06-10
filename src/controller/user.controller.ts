/* eslint-disable prefer-const */
import { Request, Response } from 'express';
import IUserInterface from '../interface/user.interface';
import userServices from '../services/user.service';
import { generateToken } from '../utils/generateToken';
import { IRequest } from '../interface/IRequest.interface';
import businessService from '../services/business.service';
import queueService from '../services/queue.service';

const { findUser, createNewUser } = userServices;
const { verifyBusiness, findBusinessesCloseToUser } = businessService;
const { joinQueue, getQueue, queueMemberPosition } = queueService

export default class userController {
  static async signin(req: Request, res: Response): Promise<any> {
    let data = req.body as IUserInterface;
    // check user exist
    console.log("data =>", req, data)
    const role = req.query 
    if(data.email) {
      // check user exist 
      let user = await findUser(data.email);
      if (!user) {
        // create user record
        if (role) {
          data = {
            ...data,
            ...role,
          };
        }
        user = await createNewUser(data);
      }
      const token = generateToken(user.id, user.role);
      return res.status(200).json({
        message: 'login successful',
        data: {
          ...user,
          token,
        },
      });
    } else {
      throw Error('please enter login info');
    }
  }

  static async joinQueue(req: IRequest, res: Response): Promise<any> {
    try {
      const userId = req.decoded.id;
      const { businessId } = req.params;
      // join queue algorithm goes here
      const queue = await joinQueue(userId, businessId, req);
      return res.status(200).json({
        message: 'you have joined the queue',
        data: queue,
      });
    } catch (error) {
      res.status(401).json({
        message: error.message
      })
    }
  }

  static async positionOnQueue (req: IRequest, res: Response): Promise<any> {
    try {
      const userId = req.decoded.id;
      const {queueId} = req.params;
      const queue = await getQueue(queueId);
      console.log("queue =>", queue)
      const position = await queueMemberPosition(userId, queue.members);
      const text = `${position > 1 ? `You are now number ${position} on the queue. Prepare to be attnded to` : `You are next in line. Prepare to be attended to.` }`
      return res.status(200).json({
        message: text
      })
    } catch (error) {
      res.status(401).json({
        message: error.message
      }) 
    }
  }

  //get businesses close to a user
  static async getBusinessesCloseToUser(
    req: IRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.decoded.id;
      const businesses = await findBusinessesCloseToUser(userId, req);
      return res.status(200).json({
        message: 'businesses close to you',
        data: businesses,
      });
    } catch (error) {
      res.status(401).json({
        message: error.message,
      });
    }
  }

  // search for a businesses by name
  static async searchBusinesses(req: IRequest, res: Response): Promise<any> {
    try {
      const { name } = req.params;
      const businesses = await businessService.searchBusinessesByName(name);
      return res.status(200).json({
        message: 'list of businesses',
        data: businesses,
      });
    } catch (error) {
      res.status(401).json({
        message: error.message,
      });
    }
  }
}
