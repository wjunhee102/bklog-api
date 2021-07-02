export type PageInfo = {
  pageId: string;
  authorId: string;
  editorList: string[];
}

export type BlockStyle = any;

export type TextStyle = {
  color: string | null;
  backgroundColor: string | null;
}

export interface BlockTextProps {
  type: string;
  style: TextStyle | null;
  contents: any;
}

/**
 * text block types
 */
export type ContentType = ["b"] 
  | ["i"] 
  | ["_"] 
  | ["a", string] 
  | ["fc", string] 
  | ["bc", string];


export type TextContents = [string] | [string, ContentType[]];

/**
 * type: "text" | "image" | "container"
 */
// export interface BlockData<Props = any> {
//   id: string;
//   type: string;
//   parentBlockId: string;
//   preBlockId: string;
//   nextBlockId: string;
//   propery: Props;
//   children: string[];
// }

export interface BlockData<T = any, P = any> {
  position: string; // 1,  1-1,  1-2-1
  id: string;
  type: string;
  styleType: string;
  styles: T;
  contents: P;
}
