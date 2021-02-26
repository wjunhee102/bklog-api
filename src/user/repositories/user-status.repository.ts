import { EntityRepository, Repository } from "typeorm";
import { UserStatus } from "src/entities/user/user-status.entity";

@EntityRepository(UserStatus)
export class UserStatusRepository extends Repository<UserStatus> {}