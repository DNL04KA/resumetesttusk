import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Experience } from '../generated/prisma/client.js';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

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
