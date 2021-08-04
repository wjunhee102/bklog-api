import { ValidationError } from "joi";

export type ValidationData<T> = {
  value: T;
  error?: ValidationError;
}