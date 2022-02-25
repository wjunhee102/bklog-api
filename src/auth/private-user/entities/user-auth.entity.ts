import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { UserPrivacy } from "./user-privacy.entity";
import { ChildTable } from "src/entities/base/child-table";

@Entity({ name: 'user-auth' })
export class UserAuth extends ChildTable {

  @Column({
    type: 'varchar',
    length: 100
  })
  password!: string;

  @Column({
    name: 'count_of_failures',
    type: 'tinyint',
    width: 10,
    default: 0
  })
  countOfFailures!: number;

  @OneToOne(()=> UserPrivacy)
  @JoinColumn()
  userPrivacy!: UserPrivacy
  
}