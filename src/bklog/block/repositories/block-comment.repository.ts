import { BlockComment } from "src/entities/bklog/block-comment.entity";
import { Repository, EntityRepository } from "typeorm";

@EntityRepository(BlockComment)
export class BlockCommentRepository extends Repository<BlockComment> {}