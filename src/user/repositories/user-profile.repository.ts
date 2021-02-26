import { Repository, EntityRepository } from 'typeorm';
import { UserProfile } from 'src/entities/user/user-profile.entity';


@EntityRepository(UserProfile)
export class UserProfileRepository extends Repository<UserProfile> {}