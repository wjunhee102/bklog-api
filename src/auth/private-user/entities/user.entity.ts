import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { UserAuth } from "./user-auth.entity";
import { UserProfile } from "src/entities/user/user-profile.entity";
import { UserStatus } from "src/entities/user/user-status.entity";

@Entity({name: "user"})
export class User {

  @PrimaryColumn({
    type: "varchar",
    length: 255
  })
  id: string;

  @Column({
    type: "varchar",
    length: 20
  })
  name: string;

  @Column({
    type: "varchar",
    length: 100
  })
  email: string;

  @CreateDateColumn({
    name:"created_at"
  })
  createdDate: Date;

  @UpdateDateColumn({
    name:"updated_at"
  })
  updatedDate: Date;

  @Column({
    name:"last_sign_in_date",
    type: 'date',
    nullable: true,
    default: null
  })
  lastSignInDate: Date;

  @OneToOne(()=> UserAuth)
  @JoinColumn()
  userAuth: UserAuth;

  @OneToOne(()=> UserProfile) 
  @JoinColumn()
  userProfile: UserProfile;

  @OneToOne(()=> UserStatus)
  @JoinColumn()
  UserStatus: UserStatus;
  
}