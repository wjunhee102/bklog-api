import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({name: "user-status"})
export class UserStatus {
  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id: number;

  @Column({
    name: "last-access-time",
    type: "datetime",
    nullable: true,
    default: null
  })
  lastAccessTime: Date;

  @Column({
    name: "is-not-dormant",
    type: "tinyint",
    width: 1,
    default: 1
  })
  isNotDormant: boolean;

  @Column({
    name: "is-active",
    type: "tinyint",
    width: 1,
    default: 1
  })
  isActive: boolean;

}