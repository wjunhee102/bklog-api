import { Repository, EntityRepository } from "typeorm";
import { UserFollowing } from "src/entities/user/user-following.entity";

@EntityRepository(UserFollowing)
export class UserFollowingRepository extends Repository<UserFollowing> {}