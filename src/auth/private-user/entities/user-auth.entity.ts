import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { UserPrivacy } from "./user-privacy.entity";
import { SubTable } from "src/entities/base/sub-table";

@Entity({ name: 'user-auth' })
export class UserAuth extends SubTable {

  @Column({
    type: 'varchar',
    length: 100
  })
  password: string;

  @Column({
    name: 'count_of_failures',
    type: 'tinyint',
    width: 10,
    default: 0
  })
  countOfFailures: number;

  @OneToOne(()=> UserPrivacy)
  @JoinColumn()
  userPrivacy: UserPrivacy
  
}