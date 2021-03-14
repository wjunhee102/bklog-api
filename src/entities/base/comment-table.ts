import { DateTable } from "./date-table";
import { PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { UserProfile } from "../user/user-profile.entity";

export abstract class CommentTable extends DateTable {

  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id: number;

  @Column({
    type: "varchar",
    width: 255
  })
  comment: string;

  @ManyToOne(() => UserProfile)
  userProfile: UserProfile;
  
};