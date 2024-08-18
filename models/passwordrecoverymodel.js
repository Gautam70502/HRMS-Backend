import mongoose from "mongoose";

const passwordRecoverySchema = mongoose.Schema({
  userId: {
    type: String,
  },
  recoveryToken: {
    type: String,
  },
  recoveryTokenExpiry: {
    type: Date,
  },
});

const passwordRecoveryModel = new mongoose.model(
  "passwordrecovery",
  passwordRecoverySchema,
);

export default passwordRecoveryModel;
