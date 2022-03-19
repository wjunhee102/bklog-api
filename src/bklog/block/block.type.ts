import { TextStyle, TextContents } from "src/types/bklog";
import { Page } from "src/entities/bklog/page.entity";
import { Block } from "src/entities/bklog/block.entity";
import { BlockComment } from "src/entities/bklog/block-comment.entity";
import { UnionBlockGenericType } from "./type";

export const TYPE_TEXT = "text" as const;

// export type BlockTypes = "text" | "container" | "image";
export type BlockTypes = "text" | "container";


export interface ReqBlockProps<T extends UnionBlockGenericType = UnionBlockGenericType> {
  type?: T["type"];
  previousId?: string | null;
  parentId?: string | null;
  styleType?: string;
  styles?: T["styles"];
  contents?: T["contents"];
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