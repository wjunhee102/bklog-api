import { Repository, EntityRepository } from "typeorm";
import { UserFollow } from "src/entities/user/user-follow.entity";

@EntityRepository(UserFollow)
export class UserFollowRepository extends Repository<UserFollow> {}