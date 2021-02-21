import { ValidationError } from "Joi";

export type ValidationData<T> = {
  value: T;
  error?: ValidationError;
}