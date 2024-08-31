import jwt from "jsonwebtoken";
import { customError } from "../utils.js";
import dotenv from "dotenv";
dotenv.config("./.env");

export const verifyuser = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      throw customError("Token Not Found", 404);
    }

    const bearertoken = token.split(" ");

    const { userId, exp } = jwt.verify(
      bearertoken[1],
      process.env.JWT_SECRET_KEY,
    );
    if (Date.now() >= exp * 1000) {
      throw customError("Token Expired", 401);
    }
    req.userId = userId;
    next();
  } catch (err) {
    return res
      .status(err.statuscode || 403)
      .json({ error: err.errormessage || "Forbidden" });
  }
};
