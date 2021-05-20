export class ResponseErrorTypes {
  code: number | string;
  type: string;
  message: string;
  detail: string;
}

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

  public _code(code: number): ResponseError {
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

  static get exp(): ResponseErrorTypes {
    return new ResponseError().build(
      "인증 시간이 만료되었습니다.",
      "token expiration",
      "001",
      "AUTH"
    ).get();
  }

  static get info(): ResponseErrorTypes {
    return new ResponseError().build(
      "인증 정보가 불일치합니다.",
      "token information mismatch",
      "002",
      "AUTH"
    );
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

  static get notFound(): ResponseErrorTypes {
    return new ResponseError().build(
      "찾을 수 없습니다.",
      "not found",
      "001",
      "Common"
    ).get();
  }
}

export class SystemErrorMessage extends ResponseError {

  constructor() {
    super();
    this.code = "System";
  }
  
  static get db(): ResponseErrorTypes {
    return new ResponseError().build(
      "잠시 후 다시 시도해주십쇼",
      "Database Error",
      "001",
      "System"
    ).get();
  }

}

export class Response {
  data: any;
  code: number = 200;
  response: any;

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

  public error(error: ResponseErrorTypes, code: number = 400): Response {
    this.code = code;
    this.data = { error };
    return this;
  }

  public badReq(): Response {
    this.code = 400;
    return this;
  }

  public unauthorized(): Response {
    this.code = 401;
    return this;
  }

  public forbidden(): Response {
    this.code = 403;
    return this;
  }

  public notFound(): Response {
    this.code = 404;
    return this;
  }

  public systemError(): Response {
    this.code = 500;
    return this;
  }

  public send() {
    this.response.status(this.code);
    this.response.send(this.data);
  }

  get Data(): any {
    return this.data;
  }

  get Code(): number {
    return this.code;
  }

}
