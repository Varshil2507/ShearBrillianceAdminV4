import * as Yup from "yup";

export const strictNameValidation = Yup.string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(25, "Name must be at most 25 characters")
  .matches(/^[a-zA-Z]+$/, "Name must only contain letters");
