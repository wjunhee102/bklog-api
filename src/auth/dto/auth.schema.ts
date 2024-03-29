import * as Joi from 'joi';
import { RequiredUserInfo, UserAuthInfo } from '../private-user/types/private-user.type';
import { TargetUser, ClientUserInfo } from '../auth.type';

export const registerSchema: Joi.ObjectSchema<any> = Joi.object({
  email: Joi.string().required(),
  name: Joi.string().required(),
  password: Joi.string().required()
});

export const authInfoSchema: Joi.ObjectSchema<UserAuthInfo> = Joi.object<UserAuthInfo>({
  email: Joi.string().required(),
  password: Joi.string().required()
});

export const requiredUserInfoSchema: Joi.ObjectSchema<RequiredUserInfo> = Joi.object({
  penName: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
});

export const activateUserSchema: Joi.ObjectSchema<TargetUser> = Joi.object({
  email: Joi.string().required()
});

export const reissueTokenSchema: Joi.ObjectSchema<ClientUserInfo> = Joi.object({
  userId: Joi.string()
}) 