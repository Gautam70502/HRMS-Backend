import passwordRecoveryModel from "../models/passwordrecoverymodel.js";
import userModel from "../models/usermodel.js";
import otpModel from "../models/otpmodel.js";
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
import { UploadFileToCloudinary } from "./cloudinaryservice.js";
import { getUserByEmail } from "./userservice.js";
import jwt from "jsonwebtoken";

export const signUp = async (req, res) => {
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
    } = req.body;

    const isExistingUser = await userModel.findOne({ emailId });

    const isExistingUserName = await userModel.findOne({ userName });

    if (isExistingUserName) {
      throw customError("username already exist", 400);
    }

    if (isExistingUser) {
      throw customError("emailId Already exist", 400);
    }
    const securityquestion = getRandomSecurityQuestion();
    securityQuestion = securityquestion;
    const hashpassword = await encriptPassword(password);

    if (!req.file) {
      const filePath = await serveDefaultUserAvatar();
      const user = new userModel({
        fullName,
        userName,
        emailId,
        password: hashpassword,
        phoneNumber,
        dateOfBirth,
        address,
        profilePicture: filePath,
        securityQuestion,
        securityAnswer,
        role,
        isMFAEnabled,
      });
      await user.save();
    } else {
      const fileUrl = await UploadFileToCloudinary(req.file);
      console.log(fileUrl);
      const user = new userModel({
        fullName,
        userName,
        emailId,
        password: hashpassword,
        phoneNumber,
        dateOfBirth,
        address,
        profilePicture: fileUrl,
        securityQuestion,
        securityAnswer,
        role,
        isMFAEnabled,
      });
      await user.save();
    }
    return res
      .status(200)
      .json({ message: "user created successfully", data: securityQuestion });
  } catch (err) {
    console.log(err);
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};

export const Login = async (req, res) => {
  try {
    const { emailId, userName, password } = req.body;
    let user;
    if (userName || emailId) {
      user = await userModel.findOne({
        $or: [
          {
            emailId,
          },
          {
            userName,
          },
        ],
      });
    }
    if (!user) {
      throw customError("User Not Found", 404);
    }
    const verifyPassword = await decriptPassword(password, user.password);
    if (!verifyPassword) {
      throw customError("Wrong Password", 400);
    }
    const accesstoken = await generateJwtToken(
      user._id,
      "1h",
      process.env.JWT_SECRET_KEY,
    );
    const refreshtoken = await generateJwtToken(
      user._id,
      "7 days",
      process.env.JWT_SECRET_KEY,
    );
    return res.status(200).json({
      message: "Login Successfully",
      data: user,
      accesstoken,
      refreshtoken,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};

export const generatePasswordLink = async (req, res) => {
  try {
    const { emailId } = req.body;
    const user = await getUserByEmail(emailId);
    if (!user) {
      throw customError("User Not Found", 404);
    }
    const recoveryToken = generateRecoveryToken(32);
    let currentDate = new Date();
    let currentTimeInMs = currentDate.getTime();
    let newTimeInMs = currentTimeInMs + 5 * 60 * 1000;
    let newDate = new Date(newTimeInMs);
    const passwordrecovery = new passwordRecoveryModel({
      userId: user._id,
      recoveryToken,
      recoveryTokenExpiry: newDate,
    });
    await passwordrecovery.save();

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
      res
        .status(200)
        .json({ message: "password recovery mail sent successfully", info });
    });
  } catch (err) {
    console.log(err);
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const { recoveryToken, password } = req.body;
    const passwordRecovery = await passwordRecoveryModel.findOne({
      recoveryToken,
    });
    if (!passwordRecovery) {
      throw customError("No recoverytoken found", 404);
    }
    if (Date.now() < passwordRecovery.recoveryTokenExpiry) {
      const user = await userModel.findOne({ _id: passwordRecovery.userId });
      if (!user) {
        throw customError("User Not Found", 404);
      }
      const hashpassword = await encriptPassword(password);
      const updatedUser = await userModel.updateOne(
        { _id: user._id },
        { $set: { password: hashpassword } },
        { upsert: false },
      );
      if (updatedUser.matchedCount === 1 && updatedUser.modifiedCount === 1) {
        await passwordRecoveryModel.deleteOne({ _id: passwordRecovery._id });
        return res
          .status(200)
          .json({ message: "Password Updated Successfully" });
      }
    } else {
      throw customError("recoverytoken time is expired", 400);
    }
  } catch (err) {
    console.log(err);
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};

export const renewToken = async (req, res) => {
  try {
    const { refreshtoken } = req.body;

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
    return res
      .status(200)
      .json({ message: "accesstoken generated", accesstoken });
  } catch (err) {
    console.log(err);
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};

export const generateOtp = async (req, res) => {
  try {
    const { userId } = req;
    const user = await userModel.findById(userId);

    if (!user) {
      throw customError("User Not Found", 404);
    }
    const otp = generateOTP(6);
    let otpArr = [],
      otpmodel;
    otpArr.push({ otp, createdAt: Date.now() });
    const userOtp = await otpModel.findOne({ userId });
    if (userOtp?.otps.length) {
      otpArr = [...userOtp.otps, ...otpArr];
      await otpModel.updateOne(
        { _id: userOtp._id },
        { $set: { otps: otpArr } },
        { upsert: false },
      );
    }
    if (!userOtp) {
      otpmodel = new otpModel({ userId, otps: otpArr });
      await otpmodel.save();
    }

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
      res
        .status(200)
        .json({ message: "password recovery mail sent successfully", info });
    });
  } catch (err) {
    console.log(err);
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const {
      userId,
      body: { otp },
    } = req;
    if (!otp) {
      throw customError("Otp is Required", 404);
    }
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      throw customError("User Not Found", 404);
    }
    const userOtp = await otpModel.findOne({ userId });
    const latestOtp = userOtp?.otps
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .find(() => true);
    if (!latestOtp.otp || otp !== latestOtp.otp) {
      throw customError("Otp Not Found", 404);
    }
    const removeRemainingOtp = userOtp?.otps.filter(
      (item) => item?.createdAt >= latestOtp?.createdAt,
    );
    await otpModel.updateOne(
      { _id: userOtp._id },
      { $set: { otps: removeRemainingOtp } },
      { upsert: false },
    );
    return res.status(200).json({ message: "Successfully verified Otp" });
  } catch (err) {
    console.log(err);
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};
