import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Skill } from '../skill/entities/skill.entity.js';
import { SkillService } from '../skill/skill.service.js';
import { Profile } from './entities/profile.entity.js';
import { ProfileService } from './profile.service.js';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
    private readonly skillService: SkillService,
  ) {}

  @Query(() => Profile, { description: 'Профиль владельца визитки' })
  profile(): Promise<Profile> {
    return this.profileService.findOne();
  }

  @ResolveField(() => [Skill], { description: 'Навыки и технологии' })
  skills(@Parent() profile: Profile): Promise<Skill[]> {
    return this.skillService.findByProfileId(profile.id);
  }
}
