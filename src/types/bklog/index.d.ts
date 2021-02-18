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
 * type: "text" | "image" | "container"
 */
export interface BlockData<Props = any> {
  id: string;
  type: string;
  parentBlockId: string;
  preBlockId: string;
  nextBlockId: string;
  propery: Props;
  children: string[];
}
