import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, ManyToOne } from "typeorm";
import { UserProfile } from "../user/user-profile.entity";
import { Block } from "./block.entity";
import { Page } from "./page.entity";

@Entity({ name: "block-comment" })
export class BlockComment {
  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id: number;

  @CreateDateColumn({
    name: "create_at"
  })
  createdDate: Date;

  @UpdateDateColumn({
    name: "updated_at"
  })
  updatedDate: Date;

  @Column({
    type: "varchar",
    width: 255
  })
  comment: string;

  @ManyToOne(() =>  UserProfile)
  userProfile: UserProfile;

  @ManyToOne(() => Block)
  block: Block;

  @ManyToOne(() => Page)
  page: Page;

}