import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { Project } from './entities/project.entity.js';
import { ProjectService } from './project.service.js';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => Project, { description: 'Проект по идентификатору' })
  project(@Args('id', { type: () => ID }) id: string): Promise<Project> {
    return this.projectService.findById(Number(id));
  }
}
