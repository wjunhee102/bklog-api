import * as UUID from 'uuid'

export class Token {
  static getUUID(): string{
    const token: string[] = UUID.v4().split('-');
    const uuid: string = token[2] + token[1] + token[0] + token[3] + token[4];
    return uuid;
  }
}