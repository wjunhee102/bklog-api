import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { UserStatus } from "./user-status.entity";
import { PageComment } from "../bklog/page-comment.entity";
import { PageStar } from "../bklog/page-star.entity";
import { UserFollower } from "./user-follower.entity";
import { UserFollowing } from "./user-following.entity";
import { Page } from "../bklog/page.entity";

/**
 * id는 uuid
 * pen name은 중복 불가
 */
@Entity({name: "user-profile"})
export class UserProfile {

  @PrimaryColumn({
    name: "user_profile_id",
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    name: "pen_name",
    type: "varchar",
    length: 100
  })
  penName: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    default: null
  })
  photo: string;

  @Column({
    type: "varchar",
    length: 100,
    nullable: true,
    default: null
  })
  bio: string;

  @Column({
    name: "cover-color",
    type: "varchar",
    length: 20,
    nullable: true,
    default: null
  })
  coverColor: string;

  @Column({
    name: "cover-image",
    type: "varchar",
    length: 20,
    nullable: true,
    default: null
  })
  coverImage: string;

  @OneToOne(() => UserStatus)
  @JoinColumn()
  userStatus: UserStatus;

  @OneToMany(() => Page, page => page.userProfile)
  page: Page[];

  @OneToMany(() => UserFollowing, userFollowing => userFollowing.userProfile)
  userFollowing: UserFollowing[];

  @OneToMany(() => UserFollower, userFollower => userFollower.userProfile)
  userFollower: UserFollower[];

  @OneToMany(() => PageComment, pageComment => pageComment.userProfile)
  pageComments: PageComment[];


}