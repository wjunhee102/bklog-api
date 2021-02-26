import * as Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().required(),
  name: Joi.string().required(),
  password: Joi.string().required()
});

export const authInfoSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
});