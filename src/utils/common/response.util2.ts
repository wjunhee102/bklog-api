import { Logger } from "@nestjs/common";

type ResultService<Data = any, Error = any> = Data & {
  success: boolean;
  error?: Error
} | string;

export function ResponseMessage(result: ResultService, errorMessage?: any) {
  if(errorMessage) {
    Logger.error(errorMessage);
  }

  if(typeof result === "string") {
    return {
      success: false,
      error: result
    }
  }
  return result;
}