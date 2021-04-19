import { BlockTextProperty } from "src/entities/bklog/text-property.entity";
import { TextStyle, TextContents } from "src/types/bklog";
import { Page } from "src/entities/bklog/page.entity";
import { BlockProperty } from "src/entities/bklog/block-property.entity";

export const TYPE_TEXT = "text" as const;

// export type BlockTypes = "text" | "container" | "image";
export type BlockTypes = "text" | "container";

export type BlockProperties = any | BlockTextProperty | null;

export interface ReqBlockProps {
  type?: BlockTypes;
  parentBlockId?: string;
  preBlockId?: string;
  nextBlockId?: string;
  children?: string[];
}

export interface BlockUpdateProps extends ReqBlockProps {
  id: string;
}

export interface RequiredBlock extends ReqBlockProps {
  page: Page;
  property: BlockProperty;
  id?: string;
}

export interface PropertyUpdateProps {
  blockId: string;
  type?: string;
  styles?: string;
  contents?: any[];
}

export interface RequiredBlockProperty {
  type: string;
  styles: any;
  contents: any[]; 
}

export interface InfoToFindBlock {
  id?: string;
  parentBlockId?: string;
  preBlockId?: string;
  nextBlockId?: string;
  page?: Page;
}

export interface TextPropsInfo {
  type: string;
  style?: TextStyle;
  contents?: TextContents[];
}

export interface PropsInfo {
  type: BlockTypes;
  info: TextPropsInfo | null;
} 

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