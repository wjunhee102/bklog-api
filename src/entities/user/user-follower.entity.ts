import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { UserProfile } from "./user-profile.entity";

@Entity({name: "user-follower"})
export class UserFollower {
 
  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id: number;

  @ManyToOne(() => UserProfile)
  userProfile: UserProfile;

  @ManyToOne(() => UserProfile)
  relativeProfile: UserProfile;

  @CreateDateColumn({
    name: "created_at"
  })
  createdDate: Date;

}