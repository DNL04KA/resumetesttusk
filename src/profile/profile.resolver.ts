import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { SortOrder } from '../common/sort-order.enum.js';
import { Experience } from '../experience/entities/experience.entity.js';
import { ExperienceService } from '../experience/experience.service.js';
import { Project } from '../project/entities/project.entity.js';
import { ProjectService } from '../project/project.service.js';
import { Skill } from '../skill/entities/skill.entity.js';
import { SkillService } from '../skill/skill.service.js';
import { Profile } from './entities/profile.entity.js';
import { ProfileService } from './profile.service.js';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
    private readonly skillService: SkillService,
    private readonly experienceService: ExperienceService,
    private readonly projectService: ProjectService,
  ) {}

  @Query(() => Profile, { description: 'Профиль владельца визитки' })
  profile(): Promise<Profile> {
    return this.profileService.findOne();
  }

  @ResolveField(() => [Skill], { description: 'Навыки и технологии' })
  skills(@Parent() profile: Profile): Promise<Skill[]> {
    return this.skillService.findByProfileId(profile.id);
  }

  @ResolveField(() => [Experience], { description: 'Опыт работы' })
  experiences(
    @Parent() profile: Profile,
    @Args('order', {
      type: () => SortOrder,
      defaultValue: SortOrder.DESC,
      description: 'Направление сортировки по дате начала работы',
    })
    order: SortOrder,
  ): Promise<Experience[]> {
    return this.experienceService.findByProfileId(profile.id, order);
  }

  @ResolveField(() => [Project], { description: 'Проекты из портфолио' })
  projects(@Parent() profile: Profile): Promise<Project[]> {
    return this.projectService.findByProfileId(profile.id);
  }
}
