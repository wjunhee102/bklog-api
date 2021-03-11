import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Page } from "./page.entity";
import { UserProfile } from "../user/user-profile.entity";
import { CommentToComment } from "./comment-comment.entity";

@Entity({name: "page-comment"})
export class PageComment {
  
  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id: number;

  @CreateDateColumn({
    name: "created_at"
  })
  createdDate: Date;

  @UpdateDateColumn({
    name: "updated_at"
  })
  updatedDate: Date;

  @Column({
    type: "varchar",
    width: 255
  })
  comment: string;

  @ManyToOne(() => UserProfile)
  userProfile: UserProfile;
  
  @ManyToOne(() => Page)
  page: Page;

  @OneToMany(() => CommentToComment, commentTocomment => commentTocomment.PageComment)
  commentTocomment: CommentToComment[];

}