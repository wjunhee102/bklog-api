import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserProfile } from "../user/user-profile.entity";
import { Page } from "./page.entity";

@Entity({name: "page-editor"})
export class PageEditor {
  
  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id!: number;

  // 0: 생성자, 1: 주 작성자,  2: 일반 작성자
  @Column({
    name!: "authority",
    type!: "tinyint",
    default!: 2
  })
  authority!: number;

  @ManyToOne(() => Page, Page => Page.editorList)
  page!: Page;

  @ManyToOne(() => UserProfile, userProfile => userProfile.editableList)
  userProfile!: UserProfile;

}