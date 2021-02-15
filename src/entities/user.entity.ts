import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({name:"user", schema:"test"})
export class User {

  @PrimaryGeneratedColumn({
    name: "user_id"
  })
  id: number;

  @Column({length: 40})
  uuid: string;

  @Column({length: 20})
  name: string;

  @Column({length: 100})
  email: string;

  @Column({length: 100})
  password: string;
  
  @CreateDateColumn({
    name:"last_login_date"
  })
  lastLoginDate: Date;
  
  @CreateDateColumn({
    name:"created_at"
  })
  createdDate:Date;

  @UpdateDateColumn({
    name:"updated_at"
  })
  updatedDate:Date;
}