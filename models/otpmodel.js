import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  otps: {
    type: Array,
    default: [],
  },
});

const otpModel = new mongoose.model("otps", otpSchema);

export default otpModel;
