import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Project } from '../generated/prisma/client.js';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(technology?: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: technology ? { technologies: { has: technology } } : undefined,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }

  findByProfileId(profileId: number): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { profileId },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }

  async findById(id: number): Promise<Project> {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (project === null) {
      throw new NotFoundException(`Проект с id ${id} не найден`);
    }

    return project;
  }
}
