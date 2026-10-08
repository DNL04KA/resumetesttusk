import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SkillService } from './skill.service.js';
import type { Skill } from '../generated/prisma/client.js';

/**
 * Собирает обращения за навыками разных профилей, сделанные в рамках
 * одного GraphQL-запроса, и выполняет их одним SQL вместо N штук.
 * Scope.REQUEST: свой экземпляр (и свой кэш) на каждый запрос.
 */
@Injectable({ scope: Scope.REQUEST })
export class SkillLoader {
  private readonly loader: DataLoader<number, Skill[]>;

  constructor(private readonly skillService: SkillService) {
    this.loader = new DataLoader<number, Skill[]>((profileIds) =>
      this.batchByProfileIds(profileIds),
    );
  }

  load(profileId: number): Promise<Skill[]> {
    return this.loader.load(profileId);
  }

  private async batchByProfileIds(
    profileIds: readonly number[],
  ): Promise<Skill[][]> {
    const skills = await this.skillService.findByProfileIds([...profileIds]);

    const byProfile = new Map<number, Skill[]>();
    for (const skill of skills) {
      const list = byProfile.get(skill.profileId);
      if (list === undefined) {
        byProfile.set(skill.profileId, [skill]);
      } else {
        list.push(skill);
      }
    }

    return profileIds.map((profileId) => byProfile.get(profileId) ?? []);
  }
}
