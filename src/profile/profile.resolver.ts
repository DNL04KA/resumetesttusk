import { Query, Resolver } from '@nestjs/graphql';
import { Profile } from './entities/profile.entity.js';
import { ProfileService } from './profile.service.js';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile, { description: 'Профиль владельца визитки' })
  profile(): Promise<Profile> {
    return this.profileService.findOne();
  }
}
