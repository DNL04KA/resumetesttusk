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
}
