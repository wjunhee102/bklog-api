import { BlockData } from "./block/block.type";
import { PageUserInfo } from "./page/page.type";

export interface RequiredPageListInfo {
  penName: string;
  id: string | null;
}

export interface InfoToFindPageVersion {
  id?: string;
  preVersionId?: string;
}

export interface RequiredPageVersionIdList {
  id: string;
  preVersionId: string;
}

export interface ResCreateBklog {
  success: boolean;
  pageId: string | null;
  error?: {
    notUserProfile?: boolean;
    dataBaseError?: boolean;
  }
}

export interface ResGetPage {
  id: string;
  title: string;
  coverImage: string | null;
  coverColor: string | null;
  createdDate: Date;
  updatedDate: Date;
  lastAccessDate: Date;
  views: number;
  disclosureScope: number;
  blockList: BlockData[];
  version: string;
  profileId: string;
  editable: boolean;
}

export interface ParamGetPageList {
  pageUserInfo: PageUserInfo,
  reqProfileId?: string;
  skip?: number;
  take?: number;
}

/**
 * modify 
 */
export type ModifyCommand = "update" | "create" | "delete";
export type ModifySet = "block" | "property" | "comment"; 

export interface ParamModifyBlock {
  blockId: string;
  set: ModifySet;
  payload: any;
}

export interface ParamCreateBlock {
  blockId: string;
  set: "block";
  payload: BlockData;
}

export interface ParamCreateComment {
  blockId: string;
  set: "comment";
  payload: any;
}

type Combine<T, K> = T & Omit<K, keyof T>;

export type ParamCreateModifyBlock = ParamCreateBlock | ParamCreateComment;

export class ParamDeleteModity {
  blockIdList?: string[];
  commentIdList?: string[];
}

export interface ModifyBlockType {
  create?: ParamCreateModifyBlock[];
  update?: ParamModifyBlock[];
  delete?: ParamDeleteModity;
}

export interface ModifyPageInfoType {
  createdDate?: Date;
  updatedDate?: Date;
  id?: string;
  title?: string;
  coverImage?: string;
  coverColor?: string;
  lastAccessDate?: Date;
  views?: number;
  disclosureScope?: number;
  version?: string;
  profileId?: string;
  editable?: boolean;
}

export interface ModifyBklogDataType {
  modifyPageInfo?: ModifyPageInfoType;
  modifyBlockData?: ModifyBlockType;
}

export interface PageVersions {
  current: string;
  next: string;
}

export interface ReqUpdateBklog {
  profileId: string;
  pageId: string;
  pageVersions: {
    current: string;
    next: string;
  }
  data: ModifyBklogDataType
}

export interface ReqUpdatePageInfo {
  pageId: string;
  data: ModifyPageInfoType
}

export interface ResUpdateBklog {
  success: boolean,
  pageVersion: string,
  error?: {
    notEditable?: boolean,
    notCurrentVersion?: boolean,
    paramError?: boolean,
    dataBaseError?: boolean
  }
}

export interface ReqEditPageEditor {
  pageId: string;
  profileId: string;
  targetProfileId: string;
}

export interface ReqDeletePage {
  pageId: string;
  profileId: string;
}