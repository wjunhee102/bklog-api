import { Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { UserProfile } from "../user/user-profile.entity";
import { Page } from "./page.entity";

@Entity({name: "page-editable-list"})
export class PageEditableList {
  
  @PrimaryColumn({
    type: "bigint"
  })
  id: number;

  @ManyToOne(() => Page, Page => Page.editableList)
  page: Page;

  @ManyToOne(() => UserProfile, userProfile => userProfile.editableList)
  userProfile: UserProfile;

}