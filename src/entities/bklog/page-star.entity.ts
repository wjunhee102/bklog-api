import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { UserProfile } from "../user/user-profile.entity";
import { Page } from "./page.entity";
import { SubTable } from "../base/sub-table";

@Entity({ name: "page-star" })
export class PageStar extends SubTable {

  @CreateDateColumn({
    name: "created_at"
  })
  createdDate: Date;

  @ManyToOne(() => UserProfile, userProfile => userProfile.pageStars)
  userProfile: UserProfile;

  @ManyToOne(() => Page, page => page.pageStar)
  page: Page;

}