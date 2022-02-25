import { BlockContentsContainer, BlockStylesContainer, BlockTypeContainer } from "./types/container";
import { BlockContentsImage, BlockStylesImage, BlockTypeImage } from "./types/image";
import { BlockContentsText, BlockStylesText, BlockTypeText } from "./types/text";
import { BlockContentsTitle, BlockStylesTitle, BlockTypeTitle } from "./types/title";

// type
export type BlockType = BlockTypeText | BlockTypeImage | BlockTypeContainer | BlockTypeTitle;

// styles
export type BlockStyles = BlockStylesText | BlockStylesTitle | BlockStylesContainer | BlockStylesImage;

// contents
export type BlockContents = BlockContentsText | BlockContentsTitle | BlockContentsContainer | BlockContentsImage;

/**/

// generic
export interface BlockGenericType<T extends BlockType, Y extends BlockStyles, P extends BlockContents> {
  type: T;
  styles: Y;
  contents: P;
}

export type TextGenericType      = BlockGenericType<BlockTypeText, BlockStylesText, BlockContentsText>;
export type TitleGenericType     = BlockGenericType<BlockTypeTitle, BlockStylesTitle, BlockContentsTitle>;
export type ContainerGenericType = BlockGenericType<BlockTypeContainer, BlockStylesContainer, BlockContentsContainer>;
export type ImageGenericType     = BlockGenericType<BlockTypeImage, BlockStylesImage, BlockContentsImage>;

export type UnionBlockGenericType = TextGenericType 
  | TitleGenericType 
  | ContainerGenericType 
  | ImageGenericType;

export interface BlockData<T extends UnionBlockGenericType = UnionBlockGenericType> {
  position: string;
  id: string;
  type: T['type'];
  styleType: string;
  styles: T['styles'];
  contents: T['contents'];
}

export const BlockDataLength = 6;

// blockDataProps
export type BlockDataProps<T extends UnionBlockGenericType> = {
  [Property in keyof BlockData<T>]?: BlockData<T>[Property];
}

// title
export type TitleBlockData   = BlockData<TitleGenericType>;
export type TitleBlockDataProps = BlockDataProps<TitleGenericType>;

// text
export type TextBlockData   = BlockData<TextGenericType>;
export type TextBlockDataProps = BlockDataProps<TextGenericType>;

// container
export type ContainerBlockData   = BlockData<ContainerGenericType>;
export type ContainerBlockDataProps = BlockDataProps<ContainerGenericType>;

// image 
export type ImageBlockData   = BlockData<ImageGenericType>;
export type ImageBlockDataProps = BlockDataProps<ImageGenericType>;

// Union
export type UnionBlockData = TitleBlockData
  | TextBlockData
  | ContainerBlockData
  | ImageBlockData;

export type UnionBlockDataProps = TitleBlockDataProps
  | TextBlockDataProps
  | ContainerBlockDataProps
  | ImageBlockDataProps;
