import bcrypt from "bcryptjs";
import { Canvas, createCanvas } from "canvas";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config("./.env");

export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is the name of the street where you grew up?",
  "What was the name of your elementary school?",
  "What was the name of your best friend in high school?",
  "What was your favorite subject in school?",
  "What is the name of your favorite childhood friend?",
  "What is the name of your favorite movie?",
  "What was your dream job as a child?",
];

export const getRandomSecurityQuestion = () => {
  const randomElement = Math.floor(Math.random() * SECURITY_QUESTIONS.length);
  return SECURITY_QUESTIONS[randomElement];
};

export const customError = (errorMessage, statusCode) => {
  return {
    errormessage: new Error(errorMessage).message,
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

export const sendMail = (emailId, recoveryToken) => {
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
    subject: "Reset Password Link",
    html: `
<!doctype html>
<html lang="en-US">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email Template</title>
    <meta name="description" content="Reset Password Email Template.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!--100% body table-->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                          <a href="https://rakeshmandal.com" title="logo" target="_blank">
                            <img width="60" src="https://i.ibb.co/hL4XZp2/android-chrome-192x192.png" title="logo" alt="logo">
                          </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                            requested to reset your password</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            We cannot simply send you your old password. A unique link to reset your
                                            password has been generated for you. To reset your password, click the
                                            following link and follow the instructions.
                                        </p>
                                        <a href="http://localhost:3000/reset-password?recoverytoken=${recoveryToken}"
                                            style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                            Password</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.rakeshmandal.com</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>

</html>`,
  };

  return { transporter, mailOptions };
};
