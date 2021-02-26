import { EntityRepository, Repository } from "typeorm";
import { UserAuth } from "../entities/user-auth.entity";

@EntityRepository(UserAuth)
export class UserAuthRepository extends Repository<UserAuth> {}