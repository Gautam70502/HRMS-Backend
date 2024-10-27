import express from "express";
import dotenv from "dotenv";
import authroutes from "./routes/authroutes.js";
import userroutes from "./routes/userroutes.js";
dotenv.config("./.env");

const app = express();
// const __dirname = path.resolve();

app.use(express.json());
// app.use(express.urlencoded({extended : false}))

app.use(express.static("filestorage/defaults"));

app.use("/api/auth", authroutes);

app.use("/api/user", userroutes);

app.listen(process.env.PORT, () => {
  console.log(`🚀🚀🚀🚀🚀 Server ready at port ${process.env.PORT}`);
});
