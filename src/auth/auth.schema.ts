import * as Joi from 'joi';
import { RequiredUserInfo } from './private-user/types/private-user.type';

export const registerSchema = Joi.object({
  email: Joi.string().required(),
  name: Joi.string().required(),
  password: Joi.string().required()
});

export const authInfoSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
});

export const requiredUserInfoSchema: Joi.ObjectSchema<RequiredUserInfo> = Joi.object({
  penName: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  name: Joi.string().required()
});