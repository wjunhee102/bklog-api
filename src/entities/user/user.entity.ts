import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({name:"user", schema:"test"})
export class User {

  @PrimaryGeneratedColumn({
    name: "user_id",
    type: "bigint"
  })
  id: number;

  @Column({
    type: 'char',
    length: 40
  })
  uuid: string;

  @Column({
    type: 'varchar',
    length: 20
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 100
  })
  password: string;

  @Column({
    name:"last_sign_in_date",
    type: 'date',
    nullable: true,
    default: null
  })
  lastSignInDate: Date;
  
  @CreateDateColumn({
    name:"created_at"
  })
  createdDate: Date;

  @UpdateDateColumn({
    name:"updated_at"
  })
  updatedDate: Date;

  @Column({
    name: "count_of_failures",
    type: "tinyint",
    width: 10,
    default: 0
  })
  countOfFailures: number;

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