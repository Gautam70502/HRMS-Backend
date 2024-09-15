import bcrypt from "bcryptjs";
import { Canvas, createCanvas } from "canvas";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config("./.env");
import {
  OTPEmailTemplate,
  SECURITY_QUESTIONS,
  forgetPasswordEmailTemplate,
} from "./constants.js";

export const getRandomSecurityQuestion = () => {
  const randomElement = Math.floor(Math.random() * SECURITY_QUESTIONS.length);
  return SECURITY_QUESTIONS[randomElement];
};

export const customError = (errorMessage, statusCode) => {
  return {
    errormessage: errorMessage,
    statuscode: statusCode,
  };
};

export const encriptPassword = async (password) => {
  const saltRound = 7;
  const salt = await bcrypt.genSalt(saltRound);
  const hashpassword = await bcrypt.hash(password, salt);
  return hashpassword;
};

export const decriptPassword = async (password, hashPassword) => {
  const isMatch = await bcrypt.compare(password, hashPassword);

  return isMatch;
};

export const createUserDefaultImage = () => {
  const width = 300;
  const height = 300;

  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");
  context.fillStyle = "#764abc";
  context.fillRect(0, 0, width, height);
  context.fillText("G,R!", 100, 200);

  return canvas;
};

export const getFilesFromFolders = async (
  folderPath = "./filestorage",
  filePath,
) => {
  const files = fs.readdirSync(folderPath);
  console.log(files);
  const filepath = files
    .map((file) => path.join(folderPath, file))
    .filter((filepath) => filePath === filepath);
  return filepath[0];
};

export const serveDefaultUserAvatar = async () => {
  const files = fs.readdirSync("./filestorage/defaults");
  const fileName = files.map((file) => file);
  return fileName[0];
};

export const generateJwtToken = async (userId, expiresIn, secretKey) => {
  const token = jwt.sign({ userId }, secretKey, {
    expiresIn,
  });

  return token;
};

export const generateRecoveryToken = (length) => {
  return crypto.randomBytes(length).toString("hex");
};

export const sendMail = (emailId, dynamicVar, actionType) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.GOOGLE_APP_EMAILID}`,
      pass: `${process.env.GOOGLE_APP_PASSWORD}`,
    },
  });

  var mailOptions = {
    from: `${process.env.GOOGLE_APP_EMAILID}`,
    to: `gautamrathod70502@gmail.com`,
    subject:
      actionType === "forgotpassword"
        ? "Reset Password Link"
        : "One Time Password",
    html:
      actionType === "forgetpassword"
        ? `${forgetPasswordEmailTemplate(dynamicVar.val)}`
        : `${OTPEmailTemplate(dynamicVar.val)}`,
  };

  return { transporter, mailOptions };
};

export const generateOTP = (length = 6) => {
  const max = Math.pow(10, length);
  const otp = crypto.randomInt(0, max).toString().padStart(length, "0");
  return otp;
};

export const getPublicIdFromImageUrl = (imageUrl) => {
  //http://res.cloudinary.com/dqqu2761f/image/upload/v1725199587/fr9dhhs2twiz0e9vvofh.jpg
  let splitByDash = imageUrl.split("/");
  let publicId = splitByDash[splitByDash.length - 1].split(".")[0];
  return publicId;
};
