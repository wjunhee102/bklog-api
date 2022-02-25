import * as Joi from 'joi';
import { ReqCreatePage } from 'src/bklog/page/page.type';
import { ReqDeletePage, ReqEditPageEditor, ReqUpdateBklog, ReqUpdatePageInfo } from '../bklog.type';

export interface modifyData<T = any> {
  id: string;
  type: string;
  payload: T;
}

export interface ModifyBlockData {
  create?: modifyData[];
  update?: modifyData[];
  delete?: string[];
}

export const reqCreatePageSchema: Joi.ObjectSchema<ReqCreatePage> = Joi.object({
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

export const reqEditPageEditorSchema: Joi.ObjectSchema<ReqEditPageEditor> = Joi.object({
  pageId: Joi.string().required(),
  targetProfileId: Joi.string().required()
});

export const reqDeletePageSchema: Joi.ObjectSchema<ReqDeletePage> = Joi.object({
  pageId: Joi.string().required()
});