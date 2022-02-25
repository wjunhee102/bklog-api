import { Logger } from "@nestjs/common";


export function LogError(returnValue: any) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    const method = desc.value
  
    desc.value = function (...arg: any[]) {
      try {
        return method(...arg);
      } catch(e) {
        Logger.error(e);
  
        return returnValue;
      }
    }
  }
}


