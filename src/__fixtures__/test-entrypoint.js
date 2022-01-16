import validator from "ajv:./testSchema.json";

const checkValid = (value) => {
  if (!validator(value)) throw validator.errors;
  return value;
};

export default checkValid;
