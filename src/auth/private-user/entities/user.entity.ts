import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { UserAuth } from "./user-auth.entity";
import { UserProfile } from "src/entities/user/user-profile.entity";
import { UserStatus } from "src/entities/user/user-status.entity";
import { MainTable } from "src/entities/base/main-table";

@Entity({name: "user"})
export class User extends MainTable {

  @Column({
    name: "first_name",
    type: "varchar",
    length: 20
  })
  firstName!: string;

  @Column({
    name: "last_name",
    type: "varchar",
    length: 20
  })
  lastName!: string;

  @Column({
    type: "varchar",
    length: 100
  })
  email!: string;

  @Column({
    name: "last_sign_in_date",
    type: "datetime",
    nullable: true,
    default: null
  })
  lastSignInDate!: Date;

  @OneToOne(()=> UserAuth)
  @JoinColumn()
  userAuth!: UserAuth;

  @OneToOne(()=> UserProfile) 
  @JoinColumn()
  userProfile!: UserProfile;

  @OneToOne(()=> UserStatus)
  @JoinColumn()
  userStatus!: UserStatus;
  
}