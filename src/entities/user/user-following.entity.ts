import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({name: "user-following"})
export class UserFollowing {
 
  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id: number;

  @Column({
    name: "profile-id"
  })
  profileId: string;

  @Column({
    name: "relative-id"
  })
  relativeId: string;

  @CreateDateColumn({
    name: "created_at"
  })
  createdDate: Date;

}