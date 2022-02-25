import { BlockData, BlockDataProps, UnionBlockGenericType } from "./block/type";
import { PageUserInfo } from "./page/page.type";

/**
 * modify 
 */

// command

export const COMMAND_UPDATE = "update" as const;
export const COMMAND_CREATE = "create" as const;
export const COMMAND_DELETE = "delete" as const;

export type ModifyALLCommand = typeof COMMAND_UPDATE 
  | typeof COMMAND_CREATE 
  | typeof COMMAND_DELETE;
export type ModifyUpdateCommand  = typeof COMMAND_UPDATE; 

// set

export const SET_BLOCK   = "block" as const;
export const SET_COMMENT = "comment" as const;
export const SET_PAGE    = "page" as const;

export type ModifySet = typeof SET_BLOCK 
  | typeof SET_COMMENT 
  | typeof SET_PAGE; 


export interface PageInfo {
  createdDate: Date;
  updatedDate: Date;
  id: string;
  title: string;
  coverImage: string;
  coverColor: string;
  lastAccessDate: Date;
  views: number;
  disclosureScope: number;
  profileId: string;
  editable: boolean;
}  

export type PageInfoProps = {
  [Property in keyof PageInfo]?: PageInfo[Property];
}

type ModifyPayload = BlockDataProps<UnionBlockGenericType> | PageInfoProps;

interface ModifyGenericType<T extends ModifyALLCommand, Y extends ModifySet, P extends ModifyPayload, K extends string> {
  command: T;
  set: Y;
  payload: P;
  type: K;
}

/*
* block
*/

// modify

export type CreateModifyBlockGenericType<T extends UnionBlockGenericType = UnionBlockGenericType> = ModifyGenericType<typeof COMMAND_CREATE, typeof SET_BLOCK, BlockData<T>, T["type"]>;

export type UpdateModifyBlockGenericType<T extends UnionBlockGenericType = UnionBlockGenericType> = ModifyGenericType<typeof COMMAND_UPDATE, typeof SET_BLOCK, BlockDataProps<T>, T["type"]>;

export type DeleteModifyBlockGenericType = ModifyGenericType<typeof COMMAND_DELETE, typeof SET_BLOCK, BlockDataProps<UnionBlockGenericType>, UnionBlockGenericType["type"]>;

export type ModifyBlockGenericType<T extends UnionBlockGenericType = UnionBlockGenericType> = CreateModifyBlockGenericType<T> | UpdateModifyBlockGenericType<T> | DeleteModifyBlockGenericType;

/**/

// page

export type ModifyPageGenericType = ModifyGenericType<ModifyUpdateCommand, typeof SET_PAGE, PageInfoProps, string>;

// types

export type UnionModifyGenericType = ModifyBlockGenericType<UnionBlockGenericType> 
  | ModifyPageGenericType;


/*
* RawModifyData 
*/ 
export interface PartsModifyData<T extends UnionModifyGenericType = UnionModifyGenericType> {
  id: string;
  type: T["type"];
}

export interface RawModifyData<T extends UnionModifyGenericType = UnionModifyGenericType> extends PartsModifyData<T> {
  payload: T["payload"];
}

// ModifyData
export interface ModifyData<T extends UnionModifyGenericType> extends RawModifyData<T> {
  set: T["set"];
  command: T["command"];
}

export interface UpdateModifyBlockData<T extends UnionBlockGenericType = UnionBlockGenericType> {
  id: string;
  type: T["type"];
  command: typeof COMMAND_UPDATE;
  payload: BlockDataProps<T>;
}

export interface DeleteModifyBlockData {
  id: string;
  type: string;
}

export interface ModifyBlockDataProps<T extends UnionBlockGenericType = UnionBlockGenericType> {
  id: string;
  type: ModifyBlockGenericType<T>["type"];
  command: ModifyBlockGenericType<T>["command"];
  payload: ModifyBlockGenericType<T>["payload"];
}

export interface ModifyPageDataProps {
  id: string;
  payload: ModifyPageGenericType['payload'];
}

export interface ModifyBlockData {
  create?: RawModifyData<CreateModifyBlockGenericType<UnionBlockGenericType>>[];
  update?: RawModifyData<UpdateModifyBlockGenericType<UnionBlockGenericType>>[];
  delete?: PartsModifyData<DeleteModifyBlockGenericType>[];
}

export type UnionModifyData = ModifyBlockData | PageInfoProps;

export interface ModifyBklogData {
  pageInfo?: PageInfoProps;
  blockData?: ModifyBlockData;
}

//

export interface PageVersions {
  current: string;
  next: string;
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

export interface ParamGetPageList {
  pageUserInfo: PageUserInfo,
  reqProfileId?: string;
  skip?: number;
  take?: number;
}

export interface ReqUpdateBklog {
  pageId: string;
  pageVersions: {
    current: string;
    next: string;
  }
  data: ModifyBklogData
}

export interface ReqUpdatePageInfo {
  pageId: string;
  data: PageInfoProps;
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
  targetProfileId: string;
}

export interface ReqDeletePage {
  pageId: string;
}