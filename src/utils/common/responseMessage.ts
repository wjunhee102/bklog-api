export class ErrorType {
  error: string;  // error code: "AUTH-001"; 
  message: string; // error 내용
  detail: string; // 자세한 error 내용
  help: string; // http:test.com;
}

export class ResponseErrorTypes {
  code: number | string;
  type: string;
  message: string;
  detail: string;
}

const errorObj: ResponseErrorTypes = {
  code: 123,
  type: "auth",
  message: "test",
  detail: "test"
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
    code: number | string = "000", 
    type: string = "unknown",
  ): ResponseError {

    this.code = code;
    this.type = type;
    this.message = message;
    this.detail = detail;

    return this;
  }

  public setCode(code: number): ResponseError {
    this.code = code;
    return this;
  }

  public setType(type: string): ResponseError {
    this.type = type;
    return this;
  }

  public setMessage(message: string): ResponseError {
    this.message = message;
    return this;
  }

  public setDetail(detail: string): ResponseError {
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

export class SystemErrorMessage {
  
  static db(): ResponseErrorTypes {
    return new ResponseError().build(
      "잠시 후 다시 시도해주십쇼",
      "Database Error",
      "001",
      "System"
    ).get();
  }

}

export class ResponseMessage {
  data: any;
  code: number;
  res: any;

  public response(res): ResponseMessage {
    this.res = res;
    
    if(this.code) {
      res.status = this.code;
    }

    return this;
  }

  public body(data: any): ResponseMessage {
    this.data = data;
    return this;
  }

  public error(error: ResponseErrorTypes, code: number = 400): ResponseMessage {
    this.code = code;
    this.data = { error };
    return this;
  }

  public unauthorized() {
    this.code = 401;
  }

  public forbidden() {
    this.code = 403;
    return this;
  }

  public notFound() {
    this.code = 404;
    return this;
  }

  public systemError() {
    this.code = 500;
    return this;
  }

  public send() {
    this.res.send(this.data);
  }

  get Data(): any {
    return this.data;
  }

  get Code(): number {
    return this.code;
  }

}
