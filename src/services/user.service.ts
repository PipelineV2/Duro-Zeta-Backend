import IUserInterface from "../interface/user.interface";
import User from "../models/user.model";

export default class userServices { 
  static async findUser(email: string): Promise<IUserInterface | null> {
    const user = await User.findOne({email}) as any;
    if(user) {
      return {
        id: user._id,
        fullName: user.fullName,
        profilePic: user.profilePic,
        email: user.email,
        role: user.role
      } 
    } else {
      return null
    }
  }

  static async createNewUser(data: IUserInterface): Promise<IUserInterface> {
    try {
      const newUser = await User.create(data) as any
      return {
        id: newUser._id,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
        email: newUser.email,
        role: newUser.role
      }
    } catch (error) {
      throw Error(error)  
    }
  }

  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId) as any;
      if(user) {
        if(user.role === "admin") {
          return true
        }
      }
      return false
    } catch (error) {
      throw Error(error)
    }
  }

  static async findUserById(userId: string): Promise<IUserInterface> {
    try {
      const user = await User.findById(userId) as any;
      if(user) {
        return {
          id: user._id,
          fullName: user.fullName,
          profilePic: user.profilePic,
          email: user.email,
          role: user.role
        } 
      }
    } catch (error) {
      throw Error(error)
    }
  }

}