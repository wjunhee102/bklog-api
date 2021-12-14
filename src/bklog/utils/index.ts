import { BAD_REQ, ComposedResponseErrorType, FORBIDDEN, NOT_FOUND, ResponseError } from "src/utils/common/response.util";

export class BklogErrorMessage extends ResponseError {

  constructor() {
    super()
    this.code = "000";
    this.type = "Bklog"
  }

  static get notFound(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "페이지를 찾을 수 없습니다.",
      "The page does not exist or you entered an invalid page id.",
      "001"
    ).get(), NOT_FOUND]
  }

  static get updating(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "현재 수정중입니다.",
      "The page is being edited, so please send your request again after a while.",
      "002"
    ).get(), FORBIDDEN]
  }

  static get editLock(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "수정할 수 없는 페이지입니다.",
      "This page has an edit_lock enabled.",
      "003"
    ).get(), FORBIDDEN]
  }

  static get notFoundVersion(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "새로 업데이트 해주세요.",
      "Version not found or out of date.",
      "004"
    ).get(), FORBIDDEN]
  }

  static get badReq(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "잘못된 요청입니다.",
      "check the request value",
      "005"
    ).get(), BAD_REQ]
  }

  static get authorized(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "권한이 없습니다.",
      "It doesn't exist on the list of authors.",
      "006"
    ).get(), FORBIDDEN]
  }
}