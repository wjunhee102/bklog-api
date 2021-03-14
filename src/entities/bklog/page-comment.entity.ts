import { Entity, ManyToOne, OneToMany } from "typeorm";
import { Page } from "./page.entity";
import { CommentToComment } from "./comment-comment.entity";
import { CommentTable } from "../base/comment-table";

@Entity({name: "page-comment"})
export class PageComment extends CommentTable {
  
  @ManyToOne(() => Page)
  page: Page;

  @OneToMany(() => CommentToComment, commentTocomment => commentTocomment.PageComment)
  commentTocomment: CommentToComment[];

}