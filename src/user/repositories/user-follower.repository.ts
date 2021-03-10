import { Repository, EntityRepository } from "typeorm";
import { UserFollower } from "src/entities/user/user-follower.entity";

@EntityRepository(UserFollower)
export class UserFollowerRepository extends Repository<UserFollower> {}