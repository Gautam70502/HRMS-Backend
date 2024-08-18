import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { getFilesFromFolders } from "../utils.js";
import dotenv from "dotenv";
dotenv.config("./.env");

// Cloudinary Configuration

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDNARY_SECRET_KEY}`,
});

// Uploading File On Cloudinary

export const UploadFileToCloudinary = async (localfilepath) => {
  try {
    const isExistPath = getFilesFromFolders(
      "./filestorage",
      localfilepath.path,
    );
    if (!isExistPath) {
      throw "no file found to be uploaded!!";
    }
    const fileUrl = await cloudinary.uploader.upload(localfilepath.path);
    if (fileUrl.url) {
      fs.unlink(localfilepath.path, (err) => {
        console.log("remove file at ", localfilepath.path);
      });
    }

    return fileUrl.url;
  } catch (err) {
    throw err;
  }
};
