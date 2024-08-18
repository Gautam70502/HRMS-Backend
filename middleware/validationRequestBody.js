export const validateRequestBody = (validationSchema) => {
  return (req, res, next) => {
    const { error, value } = validationSchema.validate(req.body, {
      convert: true,
    });
    req.body = value;
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};
