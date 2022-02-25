import { Entity, Column, UpdateDateColumn } from "typeorm";
import { ChildTable } from "src/entities/base/child-table";

@Entity({name:"user-privacy"})
export class UserPrivacy extends ChildTable {

  @Column({
    name: "social_security_number_f",
    type: "varchar",
    length: 100,
    nullable: true,
    default: null
  })
  socailSecurityNumberF!: string;

  @Column({
    name: "social_security_number_b",
    type: "varchar",
    length: 100,
    nullable: true,
    default: null
  })
  socailSecurityNumberB!: string;

  @Column({
    type: "varchar",
    length: 20,
    nullable: true,
    default: "Republic of Korea"
  })
  country!: string;

  @Column({
    type: "varchar",
    length: 20,
    nullable: true,
    default: null
  })
  state!: string;

  @Column({
    type: "varchar",
    length: 20,
    nullable: true,
    default: null
  })
  detailedAddress!: string;

  @Column({
    name: "phone_number",
    type: "varchar",
    length: 20,
    nullable: true,
    default: null
  })
  phoneNumber!: string;

  @Column({
    name: "last_info_access_time",
    type: "date",
    nullable: true
  })
  lastInfoAccessTime!: Date;

  @UpdateDateColumn({
    name: "update_at"
  })
  updatedDate!: Date;
  
}