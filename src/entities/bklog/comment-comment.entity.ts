import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, ManyToOne } from "typeorm";
import { UserProfile } from "../user/user-profile.entity";
import { PageComment } from "./page-comment.entity";
import { CommentTable } from "../base/comment-table";

@Entity({ name: "comment-to-comment"})
export class CommentToComment extends CommentTable {

  @ManyToOne(() => PageComment)
  PageComment: PageComment;

}