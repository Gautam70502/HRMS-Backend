import userModel from "../models/usermodel.js";

export const getUserByEmail = async (emailId) => {
  const isUserExist = await userModel.findOne({ emailId });

  if (isUserExist) {
    return isUserExist;
  }
  return null;
};
