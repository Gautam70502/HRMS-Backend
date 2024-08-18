import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  emailId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  securityQuestion: {
    type: String,
    required: false,
  },
  securityAnswer: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: false,
  },
  isMFAEnabled: {
    type: Boolean,
    required: false,
  },
});

const userModel = mongoose.model("users", userSchema);

export default userModel;
