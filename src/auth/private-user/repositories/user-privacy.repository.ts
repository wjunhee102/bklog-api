import { Repository, EntityRepository } from "typeorm";
import { UserPrivacy } from "../entities/user-privacy.entity";

@EntityRepository(UserPrivacy)
export class UserPrivacyRepository extends Repository<UserPrivacy> {}