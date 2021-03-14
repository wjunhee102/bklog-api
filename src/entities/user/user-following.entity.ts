import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { UserProfile } from "./user-profile.entity";

@Entity({name: "user-following"})
export class UserFollowing {
 
  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id: number;

  @ManyToOne(() => UserProfile)
  userProfile: UserProfile;

  @ManyToOne(() => UserProfile)
  relativeProfile: UserProfile;

  @CreateDateColumn({
    name: "created-at"
  })
  createdDate: Date;

}