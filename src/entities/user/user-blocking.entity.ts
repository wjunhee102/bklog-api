import { Entity, ManyToOne} from "typeorm";
import { ChildTable } from "../base/child-table";
import { UserProfile } from "./user-profile.entity";

@Entity({ name: "user-blocking" })
export class UserBlocking extends ChildTable {
  
  @ManyToOne(() => UserProfile, userProfile => userProfile.blockedUserList)
  userProfile!: UserProfile;

  @ManyToOne(() => UserProfile, userProfile => userProfile.blockedMeList)
  blockedProfile!: UserProfile;

}