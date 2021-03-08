import { BlockTextProperty } from "src/entities/bklog/text-property.entity";
import { TextStyle, TextContents } from "src/types/bklog";
import { actionTextProps } from "./utils";

export const TYPE_TEXT = "text" as const;

export type BlockProperties = BlockTextProperty;

export interface InfoToFindBlock {
  id?: string;
  pageId?: string;
}

export interface BaseBlockInfo {
  pageId: string;
  type: string;
  parentBlockId?: string;
  preBlockId?: string;
  nextBlockId?: string;
  children?: string[];
}

export interface BaseTextPropsInfo {
  type: "text";
  info: {
    type: string;
    style?: TextStyle;
    contents?: TextContents[];
  }
}

export interface BaseBlockDataInfo {
  block: BaseBlockInfo,
  props: BaseTextPropsInfo
}

export type BasePropsInfo = BaseTextPropsInfo;

export type PropsActionsType = ReturnType<typeof actionTextProps>;

export interface BlockData {
  id: string;
  type: string;
  parentBlockId: string | null;
  preBlockId: string | null;
  nextBlockId: string | null;
  property: BlockProperties;
  children: string[];
}

