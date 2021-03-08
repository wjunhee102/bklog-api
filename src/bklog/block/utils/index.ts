import { TYPE_TEXT, BaseTextPropsInfo } from "../block.type";

export const actionTextProps = (baseTextPropsInfo: BaseTextPropsInfo) => {
  return {
    type: TYPE_TEXT,
    info: baseTextPropsInfo
  }
}