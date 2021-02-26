import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({name: "user-status"})
export class UserStatus {
  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id: number;

  @Column({
    name: "last_access_time",
    type: "date",
    nullable: true,
    default: null
  })
  lastAccessTime: Date;

  @Column({
    name: "is_not_dormant",
    type: "tinyint",
    width: 1,
    default: 1
  })
  isNotDormant: boolean;

  @Column({
    name: "is_active",
    type: "tinyint",
    width: 1,
    default: 1
  })
  isActive: boolean;

}