import { EntityRepository, Repository } from "typeorm";
import { BlockTextProperty } from "src/entities/bklog/text-property.entity";

@EntityRepository(BlockTextProperty)
export class TextPropertyRepository extends Repository<BlockTextProperty> {}