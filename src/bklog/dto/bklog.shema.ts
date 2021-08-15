import * as Joi from 'joi';
import { ReqCreatePage } from 'src/bklog/page/page.type';
import { ReqModifyBlock } from '../bklog.type';

export const reqCreatePageSchema: Joi.ObjectSchema<ReqCreatePage> = Joi.object({
  profileId: Joi.string().required(),
  title: Joi.string().required(),
  disclosureScope: Joi.number().required()
});

export const reqModifyBlockSchema: Joi.ObjectSchema<ReqModifyBlock> = Joi.object({
  pageId: Joi.string().required(),
  pageVersions: {
    current: Joi.string().required(),
    next: Joi.string().required()
  },
  data: Joi.object().required()
});