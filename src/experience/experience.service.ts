import { Injectable } from '@nestjs/common';
import { SortOrder } from '../common/sort-order.enum.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Experience } from '../generated/prisma/client.js';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileId(
    profileId: number,
    order: SortOrder = SortOrder.DESC,
  ): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      where: { profileId },
      orderBy: [{ startDate: order }, { id: order }],
    });
  }

  /**
   * Всегда возвращает записи в DESC — это каноническое представление,
   * которое кладётся в кэш DataLoader. ASC получается разворотом массива.
   */
  findByProfileIds(profileIds: number[]): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
    });
  }
}
