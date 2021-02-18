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
    name:"last_login_date",
    type: 'date',
    nullable: true,
    default: null
  })
  lastLoginDate:Date;
  
  @CreateDateColumn({
    name:"created_at"
  })
  createdDate:Date;

  @UpdateDateColumn({
    name:"updated_at"
  })
  updatedDate:Date;
}