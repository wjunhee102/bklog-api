import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { UserStatus } from "./user-status.entity";
import { PageComment } from "../bklog/page-comment.entity";
import { PageStar } from "../bklog/page-star.entity";
import { Page } from "../bklog/page.entity";
import { ChildTable } from "../base/child-table";
import { UserFollow } from "./user-follow.entity";
import { UserBlocking } from "./user-blocking.entity";
import { BlockComment } from "../bklog/block-comment.entity";
import { PageEditor } from "../bklog/page-editor.entity";

/**
 * id는 uuid
 * pen name은 중복 불가
 */
@Entity({name: "user-profile"})
export class UserProfile extends ChildTable {

  @Column({
    name: "pen-name",
    type: "varchar",
    length: 100
  })
  penName!: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    default: null
  })
  photo!: string;

  @Column({
    type: "varchar",
    length: 100,
    nullable: true,
    default: null
  })
  bio!: string;

  @Column({
    name: "cover-color",
    type: "varchar",
    length: 20,
    nullable: true,
    default: null
  })
  coverColor!: string;

  @Column({
    name: "cover-image",
    type: "varchar",
    length: 20,
    nullable: true,
    default: null
  })
  coverImage!: string;

  @OneToOne(() => UserStatus)
  @JoinColumn()
  userStatus!: UserStatus;

  @OneToMany(() => UserFollow, userFollow => userFollow.userProfile)
  followingList!: UserFollow[];

  @OneToMany(() => UserFollow, userFollow => userFollow.relativeProfile)
  followerList!: UserFollow[];

  @OneToMany(()=> UserBlocking, userBlocking => userBlocking.userProfile)
  blockedUserList!: UserBlocking[];

  @OneToMany(() => UserBlocking, userBlocking => userBlocking.blockedProfile)
  blockedMeList!: UserBlocking[];

  @OneToMany(() => Page, page => page.userProfile)
  pageList!: Page[];

  @OneToMany(() => PageStar, pageStar => pageStar.userProfile)
  pageStarList!: PageStar[];

  @OneToMany(() => PageComment, pageComment => pageComment.userProfile)
  pageCommentList!: PageComment[];

  @OneToMany(() => BlockComment, blockComment => blockComment.userProfile)
  blockCommentList!: BlockComment[];

  @OneToMany(() => PageEditor, pageEditor => pageEditor.userProfile)
  editableList!: PageEditor[];

}