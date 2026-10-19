import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Skill } from '../generated/prisma/client.js';

@Injectable()
export class SkillService {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(profileIds: number[]): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }
}
