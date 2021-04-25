import { DateTable } from "./date-table";
import { Column, ManyToOne, PrimaryColumn } from "typeorm";
import { UserProfile } from "../user/user-profile.entity";

export abstract class CommentTable extends DateTable {

  @PrimaryColumn({
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    type: "varchar",
    width: 255
  })
  comment: string;

  @ManyToOne(() => UserProfile)
  userProfile: UserProfile;
  
};