import { success } from "zod";

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
    }
    //replace req.body with validated/sanitized data
    req.body = result.data;
    next();
  };
};
