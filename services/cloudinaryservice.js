import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import {
  getFilesFromFolders,
  getPublicIdFromImageUrl,
  customError,
} from "../utils.js";
import dotenv from "dotenv";
dotenv.config("./.env");

// Cloudinary Configuration

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDNARY_SECRET_KEY}`,
});

class cloudinaryService {
  async getAllFilesFromCloudinary() {
    let images;
    try {
      await cloudinary.api.resources(
        {
          type: "upload",
          resource_type: "image",
          max_results: 100,
        },
        function (error, result) {
          if (error) {
            console.error("Error fetching images:", error);
          } else {
            console.log("Fetched images:", result.resources);
            images = result.resources;
          }
        },
      );
      const publicids = images?.map((image) => image.public_id);
      return publicids || [];
    } catch (err) {
      throw err;
    }
  }

  async UploadFileToCloudinary(localfilepath) {
    try {
      const isExistPath = getFilesFromFolders(
        "./filestorage",
        localfilepath.path,
      );
      if (!isExistPath) {
        throw customError("no file found to be uploaded!!", 404);
      }
      const fileUrl = await cloudinary.uploader.upload(localfilepath.path);
      console.log(fileUrl);
      if (fileUrl.url) {
        fs.unlink(localfilepath.path, (err) => {
          console.log("remove file at ", localfilepath.path);
        });
      }

      return fileUrl.url;
    } catch (err) {
      throw err;
    }
  }

  async RemoveFileToCloudinary(cloudinaryFilePath) {
    try {
      if (!cloudinaryFilePath) {
        throw customError("File Path is Required", 404);
      }
      const extractpublicId = getPublicIdFromImageUrl(cloudinaryFilePath);
      //  const publicids = await getAllFilesFromCloudinary();
      //  const isFileExist = publicids.find((id) => id === extractpublicId);
      //  if(!isFileExist) {
      //   throw customError('File Not Found',404);
      //  }
      const { result } = await cloudinary.uploader.destroy(
        extractpublicId,
        function (error, result) {
          if (error) {
            throw customError(`unable to remove file ${error}`, 400);
          } else {
            console.log("file deleted successfully", result);
          }
        },
      );
      if (result === "ok") return true;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

export default cloudinaryService;
