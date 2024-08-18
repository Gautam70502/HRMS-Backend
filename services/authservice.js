import passwordRecoveryModel from "../models/passwordrecoverymodel.js";
import userModel from "../models/usermodel.js";
import {
  customError,
  encriptPassword,
  decriptPassword,
  getRandomSecurityQuestion,
  serveDefaultUserAvatar,
  generateJwtToken,
  generateRecoveryToken,
  sendMail,
} from "../utils.js";
import { UploadFileToCloudinary } from "./cloudinaryservice.js";
import { getUserByEmail } from "./userservice.js";

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
    const { emailId, password } = req.body;
    const user = await userModel.findOne({ emailId });
    if (!user) {
      throw customError("Email Not Found", 404);
    }
    const verifyPassword = await decriptPassword(password, user.password);
    if (!verifyPassword) {
      throw customError("Wrong Password", 400);
    }
    const token = await generateJwtToken(
      user._id,
      "1h",
      process.env.JWT_SECRET_KEY,
    );
    return res.status(200).json({
      message: "Login Successfully",
      data: { role: user?.role, token },
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

    const { transporter, mailOptions } = sendMail(emailId, recoveryToken);
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