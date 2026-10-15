import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { SortOrder } from '../common/sort-order.enum.js';
import { Experience } from '../experience/entities/experience.entity.js';
import { ExperienceLoader } from '../experience/experience.loader.js';
import { Project } from '../project/entities/project.entity.js';
import { ProjectLoader } from '../project/project.loader.js';
import { Skill } from '../skill/entities/skill.entity.js';
import { SkillLoader } from '../skill/skill.loader.js';
import { UpdateProfileInput } from './dto/update-profile.input.js';
import { Profile } from './entities/profile.entity.js';
import { ProfileService } from './profile.service.js';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
    private readonly skillLoader: SkillLoader,
    private readonly experienceLoader: ExperienceLoader,
    private readonly projectLoader: ProjectLoader,
  ) {}

  @Query(() => Profile, { description: 'Профиль владельца визитки' })
  profile(): Promise<Profile> {
    return this.profileService.findOne();
  }

  @Query(() => [Profile], { description: 'Список профилей' })
  profiles(): Promise<Profile[]> {
    return this.profileService.findAll();
  }

  @Mutation(() => Profile, { description: 'Обновить профиль владельца визитки' })
  updateProfile(
    @Args('input') input: UpdateProfileInput,
  ): Promise<Profile> {
    return this.profileService.update(input);
  }

  @ResolveField(() => [Skill], { description: 'Навыки и технологии' })
  skills(@Parent() profile: Profile): Promise<Skill[]> {
    return this.skillLoader.load(profile.id);
  }

  @ResolveField('experience', () => [Experience], {
    description: 'Опыт работы',
  })
  experiences(
    @Parent() profile: Profile,
    @Args('order', {
      type: () => SortOrder,
      defaultValue: SortOrder.DESC,
      description: 'Направление сортировки по дате начала работы',
    })
    order: SortOrder,
  ): Promise<Experience[]> {
    return this.experienceLoader.load(profile.id, order);
  }

  @ResolveField(() => [Project], { description: 'Проекты из портфолио' })
  projects(@Parent() profile: Profile): Promise<Project[]> {
    return this.projectLoader.load(profile.id);
  }
}
