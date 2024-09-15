import prisma from "../db/prismaclient.js";
import cloudinaryService from "./cloudinaryservice.js";
import userService from "./userservice.js";
import authService from "./authservice.js";

const cloudinaryservice = new cloudinaryService(prisma);
const userservice = new userService(prisma, cloudinaryservice);
const authservice = new authService(prisma, cloudinaryservice, userservice);

export { userservice, authservice, cloudinaryservice };