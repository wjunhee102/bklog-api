import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { UserStatus } from "./user-status.entity";

/**
 * id는 uuid
 * pen name은 중복 불가
 */
@Entity({name: "user-profile"})
export class UserProfile {

  @PrimaryColumn({
    name: "user_profile_id",
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    name: "pen_name",
    type: "varchar",
    length: 100
  })
  penName: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    default: null
  })
  photo: string;

  @OneToOne(()=> UserStatus)
  @JoinColumn()
  userStatus: UserStatus

}