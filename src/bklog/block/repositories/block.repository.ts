import { EntityRepository, Repository } from "typeorm";
import { Block } from "src/entities/bklog/block.entity";

@EntityRepository(Block)
export class BlockRepository extends Repository<Block> {}