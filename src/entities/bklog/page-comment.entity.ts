import { Entity, ManyToOne } from "typeorm";
import { Page } from "./page.entity";
import { CommentTable } from "../base/comment-table";
import { UserProfile } from "../user/user-profile.entity";

@Entity({name: "page-comment"})
export class PageComment extends CommentTable {
  
  @ManyToOne(() => Page)
  page!: Page;

  @ManyToOne(() => UserProfile, userProfile => userProfile.pageCommentList)
  userProfile!: UserProfile;

}