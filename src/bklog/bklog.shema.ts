import { ReqCreatePage } from 'src/bklog/page/page.type';
import * as Joi from 'joi';
import { ParamGetPageList } from './bklog.type';

export const aa: Joi.ObjectSchema<any> = Joi.object({
  test: Joi.string().required()
});

export const getPageListPenNameSchema: Joi.ObjectSchema<ParamGetPageList> = Joi.object({
  pageUserInfo: Joi.object({
    penName: Joi.string()
  })
});

export const reqCreatePageSchema: Joi.ObjectSchema<ReqCreatePage> = Joi.object({
  profileId: Joi.string().required(),
  title: Joi.string().required(),
  disclosureScope: Joi.number().required()
});

export const testSchema = Joi.object().keys({
  data: Joi.string().required(),
  data2: Joi.string().validate(undefined)
});