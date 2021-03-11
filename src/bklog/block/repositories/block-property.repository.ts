import { Repository, EntityRepository } from "typeorm";
import { BlockProperty } from "src/entities/bklog/block-property.entity";

@EntityRepository(BlockProperty)
export class BlockPropertyRepository extends Repository<BlockProperty> {}