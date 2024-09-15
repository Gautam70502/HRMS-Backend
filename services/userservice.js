import userModel from "../models/usermodel.js";
import { customError, serveDefaultUserAvatar } from "../utils.js";

class userService {
  constructor(prisma, cloudinaryService) {
    this._prisma = prisma;
    this._cloudinaryService = cloudinaryService;
  }
  async getUserById(userId) {
    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      return null;
    }
    return user;
  }

  async getUserByEmail(emailId) {
    const isUserExist = await userModel.findOne({ emailId });

    if (isUserExist) {
      return isUserExist;
    }
    return null;
  }

  async getUserByUserName(userName) {
    const user = await userModel.findOne({ userName });

    if (!user) {
      return null;
    }
    return user;
  }

  // async updateUserProfile (req,res) {
  //     try {
  //       const {userId , file : filepath } = req;
  //       const user = await getUserById(userId);
  //       if(!user) {
  //         throw customError('User Not Found',404)
  //       }
  //       if(!filepath) {
  //         throw customError('No File Found',404)
  //       }
  //       const localfilepath = await serveDefaultUserAvatar();
  //       if(user?.profilePicture.includes(localfilepath)) {
  //         const fileUrl = await this._cloudinaryService.UploadFileToCloudinary(filepath);
  //        const updatedUser =  await userModel.updateOne(
  //           {_id : user._id},
  //           {$set : {profilePicture : fileUrl}},
  //           {upsert : false}
  //         )
  //         if (updatedUser.matchedCount === 1 && updatedUser.modifiedCount === 1) {
  //           return res.status(201).json({message : "profile picture updated successfullly"})
  //         }
  //       }
  //       else {
  //         const result = await this._cloudinaryService.RemoveFileToCloudinary(user.profilePicture);
  //         if(!result) {
  //           throw customError('unable to remove file',400);
  //         }
  //         const fileUrl = await UploadFileToCloudinary(filepath);
  //         const updatedUser =  await userModel.updateOne(
  //           {_id : user._id},
  //           {$set : {profilePicture : fileUrl}},
  //           {upsert : false}
  //         )
  //         if (updatedUser.matchedCount === 1 && updatedUser.modifiedCount === 1) {
  //           return res.status(201).json({message : "profile picture updated successfullly"})
  //         }
  //       }
  //     }
  //     catch(err) {
  //       console.log(err);
  //       return res
  //         .status(err.statuscode || 500)
  //         .json({ error: err.errormessage || "internal server error" });
  //     }
  // }

  // async updateUserField(req,res)  {
  //   try {
  //     const {userId, body : {fieldName ,fieldValue}} = req;
  //     const user = await this.getUserById(userId);
  //     if(!user) {
  //       throw customError('User Not Found',404)
  //     }
  //     console.log(user);
  //     const keys = Object.keys(user.toObject());
  //     console.log(keys)
  //     if(!keys.includes(fieldName)) {
  //       throw customError('Field Does Not Exist',404);
  //     }
  //     if(fieldName === "emailId") {
  //     const duplicateEmail = await userModel.findOne({emailId : fieldValue});
  //     if(duplicateEmail) {
  //       throw customError('Email already exists');
  //     }
  //     await userModel.updateOne(
  //       {_id : user._id},
  //       {$set : {emaildId : fieldValue}},
  //       {upsert : false}
  //     )
  //     }
  //     else if(fieldName === "userName") {
  //       const duplicateUserName = await userModel.findOne({userName : fieldValue});
  //       if(duplicateUserName) {
  //         throw customError('UserName already exists');
  //       }
  //       await userModel.updateOne(
  //         {_id : user._id},
  //         {$set : {userName : fieldValue}},
  //         {upsert : false}
  //       )
  //     }
  //     else {
  //     const val = await userModel.updateOne(
  //         {_id : user._id},
  //         {$set : {[fieldName] : fieldValue}},
  //         {upsert : false}
  //       )
  //       console.log(val)
  //     }
  //     return res.status(201).json({message : `${fieldName} updated`})

  //   }
  //   catch(err) {
  //     console.log(err);
  //       return res
  //         .status(err.statuscode || 500)
  //         .json({ error: err.errormessage || "internal server error" });
  //   }
  // }
  async updateUserProfile(userId, filepath) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw customError("User Not Found", 404);
      }
      if (!filepath) {
        throw customError("No File Found", 404);
      }
      const localfilepath = await serveDefaultUserAvatar();
      if (user?.profilePicture.includes(localfilepath)) {
        const fileUrl =
          await this._cloudinaryService.UploadFileToCloudinary(filepath);
        const updatedUser = await userModel.updateOne(
          { _id: user._id },
          { $set: { profilePicture: fileUrl } },
          { upsert: false },
        );
        if (updatedUser.matchedCount === 1 && updatedUser.modifiedCount === 1) {
          return fileUrl;
        }
      } else {
        const result = await this._cloudinaryService.RemoveFileToCloudinary(
          user.profilePicture,
        );
        if (!result) {
          throw customError("unable to remove file", 400);
        }
        const fileUrl =
          await this._cloudinaryService.UploadFileToCloudinary(filepath);
        const updatedUser = await userModel.updateOne(
          { _id: user._id },
          { $set: { profilePicture: fileUrl } },
          { upsert: false },
        );
        if (updatedUser.matchedCount === 1 && updatedUser.modifiedCount === 1) {
          return fileUrl;
        }
      }
    } catch (err) {
      throw err;
    }
  }
  async updateUserField(userId, fieldName, fieldValue) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw customError("User Not Found", 404);
      }
      console.log(user);
      const keys = Object.keys(user.toObject());
      console.log(keys);
      if (!keys.includes(fieldName)) {
        throw customError("Field Does Not Exist", 404);
      }
      if (fieldName === "emailId") {
        const duplicateEmail = await userModel.findOne({ emailId: fieldValue });
        if (duplicateEmail) {
          throw customError("Email already exists");
        }
        await userModel.updateOne(
          { _id: user._id },
          { $set: { emaildId: fieldValue } },
          { upsert: false },
        );
      } else if (fieldName === "userName") {
        const duplicateUserName = await userModel.findOne({
          userName: fieldValue,
        });
        if (duplicateUserName) {
          throw customError("UserName already exists");
        }
        await userModel.updateOne(
          { _id: user._id },
          { $set: { userName: fieldValue } },
          { upsert: false },
        );
      } else {
        const val = await userModel.updateOne(
          { _id: user._id },
          { $set: { [fieldName]: fieldValue } },
          { upsert: false },
        );
        console.log(val);
      }
    } catch (err) {
      throw err;
    }
  }
}

export default userService;
