import { Entity, Column } from "typeorm";
import { ChildTable } from "../base/child-table";

@Entity({name: "user-status"})
export class UserStatus extends ChildTable {

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