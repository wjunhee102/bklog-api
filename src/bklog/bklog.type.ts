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
  reqUserId?: string;
}


export type ModifyCommand = "update" | "create" | "delete";
export type ModifySet = "block" | "property" | "comment"; 

export interface ParamModifyBlock {
  blockId: string;
  set: ModifySet;
  payload: any;
}

export class ParamCreateBlock implements ParamModifyBlock {
  blockId: string;
  set: "block";
  payload: BlockData;
}

export class ParamCreateComment implements ParamModifyBlock {
  blockId: string;
  set: "comment";
  payload: any;
}

export class ParamDeleteModity {
  blockIdList?: string[];
  commentIdList?: string[];
}

export type ParamCreateModifyBlock = ParamCreateComment | ParamCreateBlock;

export interface ModifyBlockType {
  create?: ParamCreateBlock[];
  update?: ParamModifyBlock[];
  delete?: ParamDeleteModity;
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