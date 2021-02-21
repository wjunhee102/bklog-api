import * as Joi from 'joi';

export const signInSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
})