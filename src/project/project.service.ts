import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Project } from '../generated/prisma/client.js';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileId(profileId: number): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { profileId },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }
}
