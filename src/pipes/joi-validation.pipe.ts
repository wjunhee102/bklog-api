import { ArgumentMetadata, BadRequestException, Injectable, Logger, PipeTransform } from "@nestjs/common";
import { ObjectSchema } from "joi";
import { CommonErrorMessage } from "src/utils/common/response.util";

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value);
    console.log(metadata);

    if(error) {
      Logger.error('Validation failed');
      throw new BadRequestException(CommonErrorMessage.validationError[0]);
    }

    return value;
  }
}