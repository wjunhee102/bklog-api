import { Repository, EntityRepository } from "typeorm";
import { BlockVersion } from "src/entities/bklog/block-version.entity";

@EntityRepository(BlockVersion)
export class BlockVersionRepository extends Repository<BlockVersion> {}