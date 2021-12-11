import * as Joi from 'joi';
import { ReqCreatePage } from 'src/bklog/page/page.type';
import { ReqUpdateBklog, ReqUpdatePageInfo } from '../bklog.type';

export const reqCreatePageSchema: Joi.ObjectSchema<ReqCreatePage> = Joi.object({
  profileId: Joi.string().required(),
  title: Joi.string().required(),
  disclosureScope: Joi.number().required()
});

export const reqUpdateBklogSchema: Joi.ObjectSchema<ReqUpdateBklog> = Joi.object({
  pageId: Joi.string().required(),
  pageVersions: {
    current: Joi.string().required(),
    next: Joi.string().required()
  },
  data: Joi.object().required()
});

export const reqUpdatePageInfoSchema: Joi.ObjectSchema<ReqUpdatePageInfo> = Joi.object({
  pageId: Joi.string().required(),
  data: Joi.object().required()
});