import jwt from "jsonwebtoken";
import { customError } from "../utils.js";
import dotenv from "dotenv";
dotenv.config("./.env");

export const verifyuser = (req, res, next) => {
  try {
    const token = req.cookies.jwttoken;

    if (!token) {
      throw customError("Token Not Found", 404);
    }

    const { userId, exp } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (Date.now() >= exp * 1000) {
      throw customError("Token Expired", 401);
    }
    req.user = userId;
    next();
  } catch (err) {
    res
      .status(err.statuscode || 403)
      .json({ error: err.errormessage || "Forbidden" });
  }
};
