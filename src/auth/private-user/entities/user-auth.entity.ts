import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { UserPrivacy } from "./user-privacy.entity";

@Entity({ name: 'user-auth' })
export class UserAuth {
  @PrimaryGeneratedColumn({
    name: 'user_auth_id',
    type: 'bigint'
  })
  id: number;

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