import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, ManyToOne } from "typeorm";
import { UserProfile } from "../user/user-profile.entity";
import { Block } from "./block.entity";
import { Page } from "./page.entity";
import { CommentTable } from "../base/comment-table";

@Entity({ name: "block-comment" })
export class BlockComment extends CommentTable {

  @ManyToOne(() => Block)
  block: Block;

  @ManyToOne(() => Page)
  page: Page;

}