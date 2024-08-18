import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config("./.env");

export const mongoconnection = () =>
  mongoose
    .connect(process.env.MONGO_CONNECTION_STRING)
    .then(() => {
      console.log("MongoDb Connection Successfully");
    })
    .catch((err) => {
      console.log("MongoDb Connection Unsucessfully");
    });
