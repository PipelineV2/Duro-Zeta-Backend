/* eslint-disable prefer-const */
import { Request, Response } from "express";
import IUserInterface from "../interface/user.interface"
import userServices from "../services/user.service"
import {generateToken} from "../utils/generateToken"
import { IRequest } from "../interface/IRequest.interface";
import businessService from "../services/business.service";

const {findUser, createNewUser} = userServices;
const {verifyBusiness} = businessService

export default class userController {
  static async signin(req: Request, res: Response): Promise<any> {
    let data = req.body as IUserInterface;
    const role = req.query 
    if(data.email) {
      // check user exist 
      let user = await findUser(data.email);
      if(!user) {
        // create user record
        if(role) {
          data = {
            ...data,
            ...role
          }
        }
        user = await createNewUser(data);
      }
      const token = generateToken(user.id, user.role)
      return res.status(200).json({
        message: "login successful",
        data:{ 
          ...user,
          token
        }
      })
    } else {
      throw Error("please enter login info")
    }
  }

  // static async joinQueue(req: IRequest, res: Response) {
  //   try {
  //     const {id} = req.decoded;
  //     const {businessId} = req.params;
  //     const businessVerified = await verifyBusiness(id, businessId);
  //     if(businessVerified) {
  //       // join queue algorithm goes here
  //       return res.status(200).json({
  //         message: "joined a queue",
  //         data: businessVerified
  //       })
  //     } else {
  //       return res.status(403).json({
  //         message: "not a valid QR code!"
  //       })
  //     }
      
  //   } catch (error) {
  //     throw Error(error)
  //   }

  // }
}