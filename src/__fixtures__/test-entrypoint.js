import validator from "./testSchema.json?ajv";

export const validate = (value) => {
  if (!validator(value)) throw validator.errors;
  return value;
};
