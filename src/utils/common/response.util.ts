class ResponseErrorTypes {
  code: number | string;
  type: string;
  message: string;
  detail: string;
}

type ComposedResponseErrorType = [ ResponseErrorTypes, string | number ];

const BAD_REQ      = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN    = 403;
const NOT_FOUND    = 404;
const SERVER_ERROR = 500;

/**
 * 현재 sign-up 로직이 실패한 구간을 객체로 보내주는 데 그렇게 하지 말고
 * 전송 전에 각 항목이 true일 때만 전송 가능하도록 할 것.
 * 
 */

 export class ResponseError extends ResponseErrorTypes {
  constructor() {
    super();
  }

  public build(
    message: string = "알 수 없는 error가 발생했습니다.",
    detail: string = "unknown error",
    type: string = "unknown",
    code: number | string = "000"
  ): ResponseError {

    this.code = code;
    this.type = type;
    this.message = message;
    this.detail = detail;

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
    return [ new ResponseError().build(
      "인증 시간이 만료되었습니다.",
      "token expiration",
      "001",
      "AUTH"
    ).get(), FORBIDDEN ];
  }

  static get info(): ComposedResponseErrorType {
    return [ new ResponseError().build(
      "인증 정보가 불일치합니다.",
      "token information mismatch",
      "002",
      "AUTH"
    ).get(), FORBIDDEN ];
  }

  static get notCookie(): ComposedResponseErrorType {
    return [ new ResponseError().build(
      "token이 존재하지 않습니다.",
      "token does not exist",
      "003",
      "AUTH"
    ).get(), FORBIDDEN ];
  }

  /**
   * 나중에 해결 방법 message에 적어 놓을 것.
   */
  static get disabledUser(): ComposedResponseErrorType {
    return [ new ResponseError().build(
      "비활성화된 유저입니다.",
      "5 or more failures",
      "004",
      "AUTH"
    ).get(), FORBIDDEN ];
  }

  static get dormantUser(): ComposedResponseErrorType {
    return [ new ResponseError().build(
      "휴면 유저입니다.",
      "users who have not been connected for a long time",
      "005",
      "AUTH"
    ).get(), FORBIDDEN ];
  }

  static failureSignIn(count: number): ComposedResponseErrorType {
    let message = "가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.";
    let detail = "non-existent user";

    if(count !== -1) {
      message = `잘못된 비밀번호입니다. (실패 횟수 ${count})`;
      detail = `countOfFail ${count}`;
    } 

    return [ new ResponseError().build(
      message,
      detail,
      "006",
      "AUTH"
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
  }

  static get notFound(): ComposedResponseErrorType {
    return [ new ResponseError().build(
      "찾을 수 없습니다.",
      "not found",
      "001",
      "Common"
    ).get(), NOT_FOUND ];
  }

  static get validationError(): ComposedResponseErrorType {
    return [ new ResponseError().build(
      "형식에 맞지 않는 정보입니다.",
      "validation error",
      "002",
      "Common"
    ).get(), BAD_REQ ];
  }
}

export class SystemErrorMessage extends ResponseError {

  constructor() {
    super();
    this.code = "System";
  }
  
  static get db(): ComposedResponseErrorType {
    return [ new ResponseError().build(
      "잠시 후 다시 시도해주십쇼",
      "Database Error",
      "001",
      "System"
    ).get(), SERVER_ERROR ];
  }

}

export class Response {
  private data: any;
  private code: number | string = 200;
  private response: any;

  public res(res): Response {
    this.response = res;
    return this;
  }

  public status(code: number): Response {
    this.code = code;
    return this;
  }

  public body(data: any): Response {
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
