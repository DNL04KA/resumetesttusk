import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ProjectService } from './project.service.js';
import type { Project } from '../generated/prisma/client.js';

@Injectable({ scope: Scope.REQUEST })
export class ProjectLoader {
  private readonly loader: DataLoader<number, Project[]>;

  constructor(private readonly projectService: ProjectService) {
    this.loader = new DataLoader<number, Project[]>((profileIds) =>
      this.batchByProfileIds(profileIds),
    );
  }

  load(profileId: number): Promise<Project[]> {
    return this.loader.load(profileId);
  }

  private async batchByProfileIds(
    profileIds: readonly number[],
  ): Promise<Project[][]> {
    const projects = await this.projectService.findByProfileIds([...profileIds]);

    const byProfile = new Map<number, Project[]>();
    for (const project of projects) {
      const list = byProfile.get(project.profileId);
      if (list === undefined) {
        byProfile.set(project.profileId, [project]);
      } else {
        list.push(project);
      }
    }

    return profileIds.map((profileId) => byProfile.get(profileId) ?? []);
  }
}
