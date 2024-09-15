import { authservice, userservice } from "../services/index.js";

export const signUp = async (req, res) => {
  try {
    const securityQuestion = await authservice.signUp(req.body, req.file);
    return res
      .status(200)
      .json({ message: "user created successfully", data: securityQuestion });
  } catch (err) {
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};

export const Login = async (req, res) => {
  try {
    const { user, accesstoken, refreshtoken } = await authservice.Login(
      req.body,
    );
    return res.status(200).json({
      message: "Login Successfully",
      data: user,
      accesstoken,
      refreshtoken,
    });
  } catch (err) {
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};

export const generatePasswordLink = async (req, res) => {
  try {
    const { emailId } = req.body;
    const info = await authservice.generatePasswordLink(emailId);
    return res
      .status(200)
      .json({ message: "password recovery mail sent successfully", info });
  } catch (err) {
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    await authservice.updateUserPassword(req.body);
    return res.status(200).json({ message: "Password Updated Successfully" });
  } catch (err) {
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};

export const renewToken = async (req, res) => {
  try {
    const accesstoken = await authservice.renewToken(req.body);
    return res
      .status(200)
      .json({ message: "accesstoken generated", accesstoken });
  } catch (err) {
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};

export const generateOtp = async (req, res) => {
  try {
    const { userId } = req;
    const info = await authservice.generateOtp(userId);
    res
      .status(200)
      .json({ message: "password recovery mail sent successfully", info });
  } catch (err) {
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
    await authservice.verifyOtp(userId, otp);
    return res.status(200).json({ message: "Successfully verified Otp" });
  } catch (err) {
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};
