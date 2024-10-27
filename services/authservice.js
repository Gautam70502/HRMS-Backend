import {
  customError,
  encriptPassword,
  decriptPassword,
  getRandomSecurityQuestion,
  serveDefaultUserAvatar,
  generateJwtToken,
  generateRecoveryToken,
  sendMail,
  generateOTP,
} from "../utils.js";
import jwt from "jsonwebtoken";

class authService {
  constructor(prisma, cloudinaryService, userservice, logger) {
    this._prisma = prisma;
    this._cloudinaryService = cloudinaryService;
    this._userService = userservice;
    this._logger = logger;
  }

  async signUp(body, file) {
    try {
      let {
        fullName,
        userName,
        emailId,
        password,
        phoneNumber,
        dateOfBirth,
        address,
        securityQuestion,
        securityAnswer,
        role,
        isMFAEnabled,
      } = body;
      // const isExistingUser = await userModel.findOne({ emailId });
      const isExistingUser = await this._prisma.user.findUnique({
        where: {
          emailId: emailId,
        },
      });
      console.log(isExistingUser);
      // const isExistingUserName = await userModel.findOne({ userName });
      const isExistingUserName = await this._prisma.user.findUnique({
        where: {
          userName: userName,
        },
      });

      if (isExistingUserName) {
        throw customError("username already exist", 400);
      }

      if (isExistingUser) {
        throw customError("emailId Already exist", 400);
      }
      const securityquestion = getRandomSecurityQuestion();
      securityQuestion = securityquestion;
      const hashpassword = await encriptPassword(password);
      if (!file) {
        const filePath = await serveDefaultUserAvatar();
        const user = await this._prisma.user.create({
          data: {
            fullName,
            userName,
            emailId,
            password: hashpassword.toString(),
            phoneNumber,
            dateOfBirth,
            address,
            profilePicture: filePath,
            securityQuestion,
            securityAnswer,
            role,
            isMFAEnabled,
          },
        });
      } else {
        const fileUrl =
          await this._cloudinaryService.UploadFileToCloudinary(file);
        console.log(fileUrl);
        const user = await this._prisma.user.create({
          data: {
            fullName,
            userName,
            emailId,
            password: hashpassword.toString(),
            phoneNumber,
            dateOfBirth,
            address,
            profilePicture: fileUrl,
            securityQuestion,
            securityAnswer,
            role,
            isMFAEnabled,
          },
        });
      }
      return securityQuestion || "";
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async Login(data) {
    try {
      const { emailId, userName, password } = data;
      let user;
      if (userName || emailId) {
        user = await this._prisma.user.findFirst({
          where: {
            OR: [{ userName: userName }, { emailId: emailId }],
          },
        });
      }
      if (!user) {
        throw customError("User Not Found", 404);
      }
      console.log(user);
      const verifyPassword = await decriptPassword(password, user.password);
      if (!verifyPassword) {
        throw customError("Wrong Password", 400);
      }
      const accesstoken = await generateJwtToken(
        user?.id,
        "1h",
        process.env.JWT_SECRET_KEY,
      );
      const refreshtoken = await generateJwtToken(
        user?.id,
        "7 days",
        process.env.JWT_SECRET_KEY,
      );
      return { user, accesstoken, refreshtoken };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async generatePasswordLink(emailId) {
    try {
      const user = await this._userService.getUserByEmail(emailId);

      if (!user) {
        throw customError("User Not Found", 404);
      }
      const recoveryToken = generateRecoveryToken(32);
      let currentDate = new Date();
      let currentTimeInMs = currentDate.getTime();
      let newTimeInMs = currentTimeInMs + 5 * 60 * 1000;
      let newDate = new Date(newTimeInMs);

      await this._prisma.passwordRecovery.create({
        data: {
          userId: user.id,
          recoveryToken,
          recoveryTokenExpiry: newDate,
        },
      });
      const { transporter, mailOptions } = sendMail(
        emailId,
        { val: recoveryToken },
        "forgetpassword",
      );
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          throw customError("unable to send mail", 400);
        }
        return info;
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async updateUserPassword(data) {
    try {
      const { recoveryToken, password } = data;

      const passwordRecovery = await this._prisma.passwordRecovery.findFirst({
        where: {
          recoveryToken: recoveryToken,
        },
      });
      if (!passwordRecovery) {
        throw customError("No recoverytoken found", 404);
      }
      if (Date.now() < passwordRecovery.recoveryTokenExpiry) {
        const user = await this._prisma.passwordRecovery.findFirst({
          where: {
            id: passwordRecovery?.id,
          },
        });
        console.log(user);
        if (!user) {
          throw customError("User Not Found", 404);
        }
        const hashpassword = await encriptPassword(password);

        const updatedUser = await this._prisma.user.update({
          where: { id: user.userId },
          data: { password: hashpassword },
        });
        console.log(updatedUser);
        if (updatedUser) {
          await this._prisma.passwordRecovery.delete({
            where: { id: passwordRecovery.id },
          });
          return;
        }
      } else {
        throw customError("recoverytoken time is expired", 400);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async renewToken(data) {
    try {
      const { refreshtoken } = data;

      if (!refreshtoken) {
        throw customError("Token Not Found", 404);
      }
      const { userId, exp } = jwt.verify(
        refreshtoken,
        process.env.JWT_SECRET_KEY,
      );
      if (Date.now() >= exp * 1000) {
        throw customError("Token is Expired, Please Login Again", 401);
      }
      const accesstoken = await generateJwtToken(
        userId,
        "1h",
        process.env.JWT_SECRET_KEY,
      );
      return accesstoken;
    } catch (err) {
      throw err;
    }
  }

  async generateOtp(userId) {
    try {
      const user = await this._userService.getUserById(userId);
      if (!user) {
        throw customError("User Not Found", 404);
      }
      const otp = generateOTP(6);

      const isotpGenerated = await this._prisma.userOtp.create({
        data: {
          userId,
          otp,
        },
      });
      if (isotpGenerated) {
        const { transporter, mailOptions } = sendMail(
          user.emailId,
          { val: otp },
          "sendotp",
        );
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            throw customError("unable to send mail", 400);
          }
          return info;
        });
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async verifyOtp(userId, otp) {
    try {
      if (!otp) {
        throw customError("Otp is Required", 404);
      }

      const user = await this._userService.getUserById(userId);

      if (!user) {
        throw customError("User Not Found", 404);
      }

      const userOtp = await this._prisma.userOtp.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      });
      console.log(userOtp[0]);
      if (!userOtp[0]?.otp || otp !== userOtp[0]?.otp) {
        throw customError("Otp Not Found", 404);
      }

      this._prisma.userOtp.deleteMany({
        where: {
          userId,
        },
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

export default authService;
