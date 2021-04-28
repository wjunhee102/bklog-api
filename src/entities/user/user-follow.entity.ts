import { Entity, ManyToOne, CreateDateColumn } from "typeorm";
import { ChildTable } from "../base/child-table";
import { UserProfile } from "./user-profile.entity";

@Entity({name: "user-follow"})
export class UserFollow extends ChildTable {
  
  @ManyToOne(() => UserProfile, userProfile => userProfile.followers)
  userProfile: UserProfile;

  @ManyToOne(() => UserProfile, userProfile => userProfile.followings)
  relativeProfile: UserProfile;

}