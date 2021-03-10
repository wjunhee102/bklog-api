import { BlockTextProperty } from "src/entities/bklog/text-property.entity";
import { TextStyle, TextContents } from "src/types/bklog";
import { actionTextProps } from "./utils";

export const TYPE_TEXT = "text" as const;

// export type BlockTypes = "text" | "container" | "image";
export type BlockTypes = "text" | "container";

export type BlockProperties = BlockTextProperty | null;

export interface InfoToFindBlock {
  id?: string;
  pageId?: string;
}

export interface BaseBlockInfo {
  pageId: string;
  type:  BlockTypes;
  parentBlockId?: string;
  preBlockId?: string;
  nextBlockId?: string;
  children?: string[];
}


export interface TextPropsInfo {
  type: string;
  style?: TextStyle;
  contents?: TextContents[];
}

export interface BaseTextPropsInfo {
  type: "text";
  info: TextPropsInfo;
}

export interface BaseContainerPropsInfo {
  type: "container";
  info: null
}

export interface PropsInfo {
  type: BlockTypes;
  info: TextPropsInfo | null;
} 

export type BasePropsInfo = BaseTextPropsInfo | BaseContainerPropsInfo;

export interface BaseBlockDataInfo {
  block: BaseBlockInfo,
  props: BasePropsInfo
}

export type PropsActionsType = ReturnType<typeof actionTextProps>;

export interface BlockData {
  id: string;
  type: BlockTypes;
  parentBlockId: string | null;
  preBlockId: string | null;
  nextBlockId: string | null;
  property: BlockProperties;
  children: string[];
}

export interface ResCreateBlockDate {
  blockData: BlockData;
  versionId: string;
}
