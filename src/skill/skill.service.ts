import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Skill } from '../generated/prisma/client.js';

@Injectable()
export class SkillService {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileId(profileId: number): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      where: { profileId },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }
}
