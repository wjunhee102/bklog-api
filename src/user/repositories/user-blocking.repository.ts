import { Repository, EntityRepository } from "typeorm";
import { UserBlocking } from "src/entities/user/user-blocking.entity";

@EntityRepository(UserBlocking)
export class UserBlockRepository extends Repository<UserBlocking> {}