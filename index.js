import express from "express";
import dotenv from "dotenv";
import { mongoconnection } from "./db/connection.js";
import authroutes from "./routes/authroutes.js";
dotenv.config("./.env");
import path from "path";

const app = express();
// const __dirname = path.resolve();

app.use(express.json());
// app.use(express.urlencoded({extended : false}))

app.use(express.static("filestorage/defaults"));

app.use("/api/auth", authroutes);

mongoconnection();

app.listen(process.env.PORT, () => {
  console.log(`server listening at ${process.env.PORT}`);
});
