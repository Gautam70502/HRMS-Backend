import { userservice } from "../services/index.js";

export const updateUserField = async (req, res) => {
  try {
    const {
      userId,
      body: { fieldName, fieldValue },
    } = req;
    await userservice.updateUserField(userId, fieldName, fieldValue);
    return res.status(201).json({ message: `${fieldName} updated` });
  } catch (err) {
    console.log(err);
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId, file: filepath } = req;
    const fileUrl = await userservice.updateUserProfile(userId, filepath);
    return res
      .status(201)
      .json({ message: "profile picture updated successfullly", img: fileUrl });
  } catch (err) {
    console.log(err);
    return res
      .status(err.statuscode || 500)
      .json({ error: err.errormessage || "internal server error" });
  }
};
