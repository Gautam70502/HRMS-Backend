import Joi from "joi";

export const userRegistrationValidation = Joi.object({
  fullName: Joi.string().min(6).max(30).required(),
  userName: Joi.string().min(3).max(30).required(),
  emailId: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.once": "password do not matches" }),
  phoneNumber: Joi.string().optional(),
  dateOfBirth: Joi.date().required(),
  address: Joi.string().optional(),
  profilePicture: Joi.string().optional(),
  securityQuestion: Joi.string().optional(),
  securityAnswer: Joi.string().optional(),
  role: Joi.string().optional().default("user"),
  isMFAEnabled: Joi.bool().optional().default(false),
});

export const userLoginValidation = Joi.object({
  emailId: Joi.string().optional(),
  userName: Joi.string().optional(),
  password: Joi.string().required(),
}).xor("emailId", "userName");

export const generatePasswordLinkValidation = Joi.object({
  emailId: Joi.string().required(),
});

export const updateUserPasswordValidation = Joi.object({
  recoveryToken: Joi.string(),
  password: Joi.string().min(4).required(),
});

export const updateUserFieldValidation = Joi.object({
  fieldName: Joi.string().required(),
  fieldValue: Joi.any().required(),
});
