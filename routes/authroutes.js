import express from "express";
import { validateRequestBody } from "../middleware/validationRequestBody.js";
import {
  generatePasswordLinkValidation,
  updateUserPasswordValidation,
  userLoginValidation,
  userRegistrationValidation,
} from "../types.js";
import {
  signUp,
  Login,
  generatePasswordLink,
  updateUserPassword,
  renewToken,
  generateOtp,
  verifyOtp,
} from "../controllers/authcontroller.js";
import uploadStorage from "../middleware/multer.js";
import { verifyuser } from "../middleware/verifyuser.js";
const router = express.Router();

router.post(
  "/signup",
  uploadStorage.single("file"),
  validateRequestBody(userRegistrationValidation),
  signUp,
);
router.post("/login", validateRequestBody(userLoginValidation), Login);
router.post(
  "/generatepasswordlink",
  validateRequestBody(generatePasswordLinkValidation),
  generatePasswordLink,
);
router.patch(
  "/updatepassword",
  validateRequestBody(updateUserPasswordValidation),
  updateUserPassword,
);
router.post("/renewToken", renewToken);
router.post("/generateOtp", verifyuser, generateOtp);
router.post("/verifyotp", verifyuser, verifyOtp);

export default router;
