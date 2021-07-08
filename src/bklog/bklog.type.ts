import { BlockData } from "./block/block.type";
import { PageUserInfo } from "./page/page.type";
import { ResValitionAccessToken } from "../auth/auth.type";

export interface ResTokenValidation extends ResValitionAccessToken {
  accessToken: boolean;
}

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

export interface PageModifyDateType {
  pageInfo?: {
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
  };
  modifyData?: ModifyBlockType;
}

export interface PageVersions {
  current: string;
  next: string;
}

export interface ResModifyBlock {
  success: boolean,
  pageVersion: string,
  error?: {
    notEditable?: boolean,
    notCurrentVersion?: boolean,
    paramError?: boolean,
    dataBaseError?: boolean
  }
}