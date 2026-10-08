import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SortOrder } from '../common/sort-order.enum.js';
import { ExperienceService } from './experience.service.js';
import type { Experience } from '../generated/prisma/client.js';

/**
 * В кэше всегда лежит порядок DESC (startDate DESC, id DESC).
 * Для ASC возвращается развёрнутая КОПИЯ: reverse() мутирует массив,
 * и разворот оригинала испортил бы кэш для остальных обращений.
 */
@Injectable({ scope: Scope.REQUEST })
export class ExperienceLoader {
  private readonly loader: DataLoader<number, Experience[]>;

  constructor(private readonly experienceService: ExperienceService) {
    this.loader = new DataLoader<number, Experience[]>((profileIds) =>
      this.batchByProfileIds(profileIds),
    );
  }

  async load(profileId: number, order: SortOrder): Promise<Experience[]> {
    const experiences = await this.loader.load(profileId);

    return order === SortOrder.ASC ? [...experiences].reverse() : experiences;
  }

  private async batchByProfileIds(
    profileIds: readonly number[],
  ): Promise<Experience[][]> {
    const experiences = await this.experienceService.findByProfileIds([
      ...profileIds,
    ]);

    const byProfile = new Map<number, Experience[]>();
    for (const experience of experiences) {
      const list = byProfile.get(experience.profileId);
      if (list === undefined) {
        byProfile.set(experience.profileId, [experience]);
      } else {
        list.push(experience);
      }
    }

    return profileIds.map((profileId) => byProfile.get(profileId) ?? []);
  }
}
