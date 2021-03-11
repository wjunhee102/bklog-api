import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, ManyToOne } from "typeorm";
import { UserProfile } from "../user/user-profile.entity";
import { PageComment } from "./page-comment.entity";

@Entity({ name: "comment-to-comment"})
export class CommentToComment {

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

  @ManyToOne(() => PageComment)
  PageComment: PageComment;

}