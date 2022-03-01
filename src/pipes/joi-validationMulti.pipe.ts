import { ArgumentMetadata, BadRequestException, Injectable, Logger, PipeTransform } from "@nestjs/common";
import { ObjectSchema } from "joi";
import { CommonErrorMessage } from "src/utils/common/response.util";

interface SchemaTable {
  paramName: string;
  bodySchema: ObjectSchema;
}
@Injectable()
export class JoiValidationMutiPipe implements PipeTransform {
  constructor(private schemaTable: SchemaTable) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if(metadata.type === "param") {
      if(metadata.data === this.schemaTable.paramName && value) return value;

      Logger.error('Validation failed (param)');
      throw new BadRequestException(CommonErrorMessage.validationError[0]);
    }

    const { error } = this.schemaTable.bodySchema.validate(value);

    if(error) {
      Logger.error('Validation failed');
      throw new BadRequestException(CommonErrorMessage.validationError[0]);
    }

    return value;
  }
}