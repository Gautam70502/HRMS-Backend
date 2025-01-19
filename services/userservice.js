import { customError, serveDefaultUserAvatar } from "../utils.js";

class userService {
  constructor(prisma, cloudinaryService) {
    this._prisma = prisma;
    this._cloudinaryService = cloudinaryService;
  }
  async getUserById(userId) {
    const user = await this._prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return null;
    }
    return user;
  }

  async getUserByEmail(emailId) {
    const isUserExist = await this._prisma.user.findUnique({
      where: {
        emailId: emailId,
      },
    });

    if (isUserExist) {
      return isUserExist;
    }
    return null;
  }

  async getUserByUserName(userName) {
    const user = await this._prisma.user.findUnique({
      where: {
        userName: userName,
      },
    });
    if (!user) {
      return null;
    }
    return user;
  }

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

        const updatedUser = await this._prisma.user.update({
          where: {
            id: user?.id,
          },
          data: {
            profilePicture: fileUrl,
          },
        });
        if (updatedUser) {
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
        const updatedUser = await this._prisma.user.update({
          where: {
            id: user?.id,
          },
          data: {
            profilePicture: fileUrl,
          },
        });
        if (updatedUser) {
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
      const keys = Object.keys(user);
      console.log(keys);
      if (!keys.includes(fieldName)) {
        throw customError("Field Does Not Exist", 404);
      }
      if (fieldName === "emailId") {
        const duplicateEmail = await this.getUserByEmail(fieldValue);
        if (duplicateEmail) {
          throw customError("Email already exists");
        }

        const newEmail = await this._prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            emailId: fieldValue,
          },
        });
      } else if (fieldName === "userName") {
        const duplicateUserName = await this.getUserByUserName(fieldValue);
        console.log(duplicateUserName);
        if (duplicateUserName) {
          throw customError("UserName already exists");
        }
        const newUserName = await this._prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            userName: fieldValue,
          },
        });
      } else {
        const updatedField = await this._prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            [fieldName]: fieldValue,
          },
        });
        // console.log(val);
      }
    } catch (err) {
      throw err;
    }
  }

  async listUsers(pageNumber, pageLength) {
    try {
      const page = Number(pageNumber) || 1;
      const limit = Number(pageLength) || 5;
      const skip = (page - 1) * limit;
      const users = await this._prisma.user.findMany({
        skip: skip,
        take: limit,
      });
      return users;
    } catch (err) {
      throw err;
    }
  }

  async getSearchUser() {
    try {
    } catch (err) {}
  }
}

export default userService;
