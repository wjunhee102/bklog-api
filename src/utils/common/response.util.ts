export class ResponseErrorTypes {
  code: number | string;
  type: string;
  message: string;
  detail: string;
}

export type ComposedResponseErrorType = [ ResponseErrorTypes, string | number ];

export const BAD_REQ      = 400;
export const UNAUTHORIZED = 401;
export const FORBIDDEN    = 403;
export const NOT_FOUND    = 404;
export const SERVER_ERROR = 500;

/**
 * 현재 sign-up 로직이 실패한 구간을 객체로 보내주는 데 그렇게 하지 말고
 * 전송 전에 각 항목이 true일 때만 전송 가능하도록 할 것.
 * 
 */

 export class ResponseError extends ResponseErrorTypes {
  constructor() {
    super();
  }

  public preBuild(
    message: string = "알 수 없는 error가 발생했습니다.",
    detail: string = "unknown error",
    code: number | string = "000",
  ): ResponseError {
    this.code = code;
    this.message = message;
    this.detail = detail;

    return this;
  }

  public build(
    message: string = "알 수 없는 error가 발생했습니다.",
    detail: string = "unknown error",
    code: number | string = "000",
    type: string = "unknown"
  ): ResponseError {

    this.preBuild(message, detail, code);
    this.type = type;

    return this;
  }

  public _code(code: number | string): ResponseError {
    this.code = code;
    return this;
  }

  public _type(type: string): ResponseError {
    this.type = type;
    return this;
  }

  public _message(message: string): ResponseError {
    this.message = message;
    return this;
  }

  public _detail(detail: string): ResponseError {
    this.detail = detail;
    return this;
  }

  public get(): ResponseErrorTypes {
    return {
      type: this.type,
      code: this.code,
      message: this.message,
      detail: this.detail
    }
  }

}

export class AuthErrorMessage extends ResponseError {

  constructor() {
    super(); 
    this.code = "000";
    this.type = "AUTH";
  }

  static get exp(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "인증 시간이 만료되었습니다.",
      "token expiration",
      "001"
    ).get(), FORBIDDEN ];
  }

  static get info(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "인증 정보가 불일치합니다.",
      "token information mismatch",
      "002"
    ).get(), FORBIDDEN ];
  }

  static get notCookie(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "token이 존재하지 않습니다.",
      "token does not exist",
      "003"
    ).get(), FORBIDDEN ];
  }

  /**
   * 나중에 해결 방법 message에 적어 놓을 것.
   */
  static get disabledUser(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "비활성화된 유저입니다.",
      "5 or more failures",
      "004"
    ).get(), FORBIDDEN ];
  }

  static get dormantUser(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "휴면 유저입니다.",
      "users who have not been connected for a long time",
      "005"
    ).get(), FORBIDDEN ];
  }

  static notFound(detail: string = "not found"): ComposedResponseErrorType {
    return [ new this().preBuild(
      "정보를 찾을 수 없습니다.",
      detail,
      "006"
    ).get(), NOT_FOUND];
  }

  static failureSignIn(count: number = 0): ComposedResponseErrorType {
    let message = "가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.";
    let detail = "non-existent user";

    if(count > 0) {
      message = `잘못된 비밀번호입니다. (실패 횟수 ${count})`;
      detail = `countOfFail ${count}`;
    } 

    return [ new this().preBuild(
      message,
      detail,
      "006"
    ).get(), FORBIDDEN ];
  }

  public _exp(): AuthErrorMessage {
    this.code = "001";
    this.message = "인증 시간이 만료되었습니다."
    this.detail = "token expiration"

    return this;
  }

  public _info(): AuthErrorMessage {
    this.code = "002";
    this.message = "인증 정보가 불일치합니다."
    this.detail = "token information mismatch"

    return this;
  }

}

export class CommonErrorMessage extends ResponseError {
  constructor() {
    super();
    this.type = "Common";
    this.code = "000";
  }

  static get notFound(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "찾을 수 없습니다.",
      "not found",
      "001"
    ).get(), NOT_FOUND ];
  }

  static get validationError(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "형식에 맞지 않는 정보입니다.",
      "validation error",
      "002"
    ).get(), BAD_REQ ];
  }
}

export class SystemErrorMessage extends ResponseError {

  constructor() {
    super();
    this.code = "System";
  }
  
  static get db(): ComposedResponseErrorType {
    return [ new this().preBuild(
      "잠시 후 다시 시도해주십쇼",
      "Database Error",
      "001"
    ).get(), SERVER_ERROR ];
  }

}

export class Response<T = any> {
  private data: T | { error: ResponseErrorTypes };
  private code: number | string = 200;
  private response: any;

  constructor() {}

  public res(res): Response {
    this.response = res;
    return this;
  }

  public status(code: number): Response {
    this.code = code;
    return this;
  }

  public body(data: T): Response {
    this.data = data;
    return this;
  }

  public error(error: ResponseErrorTypes, code: number | string = 400): Response {
    this.code = code;
    this.data = { error };
    return this;
  }

  public badReq(): Response {
    this.code = BAD_REQ;
    return this;
  }

  public unauthorized(): Response {
    this.code = UNAUTHORIZED;
    return this;
  }

  public forbidden(): Response {
    this.code = FORBIDDEN;
    return this;
  }

  public notFound(): Response {
    this.code = NOT_FOUND;
    return this;
  }

  public serverError(): Response {
    this.code = SERVER_ERROR;
    return this;
  }

  public send() {
    this.response.status(this.code);
    this.response.send(this.data);
  }

  get Data(): any {
    return this.data;
  }

  get Code(): number | string {
    return this.code;
  }

}
