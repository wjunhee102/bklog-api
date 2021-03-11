import { Repository, EntityRepository } from "typeorm";
import { CommentToComment } from "src/entities/bklog/comment-comment.entity";

@EntityRepository(CommentToComment)
export class CommentToCommentRepository extends Repository<CommentToComment> {}