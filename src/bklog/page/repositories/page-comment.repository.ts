import { Repository, EntityRepository } from "typeorm";
import { PageComment } from "src/entities/bklog/page-comment.entity";

@EntityRepository(PageComment)
export class PageCommentRepository extends Repository<PageComment> {}