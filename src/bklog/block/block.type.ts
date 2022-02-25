import { TextStyle, TextContents } from "src/types/bklog";
import { Page } from "src/entities/bklog/page.entity";
import { Block } from "src/entities/bklog/block.entity";
import { BlockComment } from "src/entities/bklog/block-comment.entity";

export const TYPE_TEXT = "text" as const;

// export type BlockTypes = "text" | "container" | "image";
export type BlockTypes = "text" | "container";


export interface ReqBlockProps {
  type?: BlockTypes;
  position?: string;
  styleType?: string;
  styles?: any;
  contents?: any[];
}

export interface BlockUpdateProps extends ReqBlockProps {
  id: string;
}

export interface RequiredBlock extends ReqBlockProps {
  page: Page;
  id: string;
}

export interface InfoToFindBlock {
  id?: string;
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

export interface BlockData<T = any, P = any> {
  position: string; // 1,  1-1,  1-2-1
  id: string;
  type: BlockTypes;
  styleType: string;
  styles: T;
  contents: P;
}

export interface ResCreateBlockDate {
  blockData: BlockData;
  versionId: string;
}