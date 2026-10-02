import { ParseIntPipe } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { Project } from './entities/project.entity.js';
import { ProjectService } from './project.service.js';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => Project, { description: 'Проект по идентификатору' })
  project(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
  ): Promise<Project> {
    return this.projectService.findById(id);
  }

  @Query(() => [Project], {
    description: 'Список проектов, при необходимости отфильтрованный по технологии',
  })
  projects(
    @Args('technology', {
      nullable: true,
      description: 'Точное название технологии, с учётом регистра',
    })
    technology?: string,
  ): Promise<Project[]> {
    return this.projectService.findAll(technology);
  }
}
