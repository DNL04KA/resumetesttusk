import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma, Profile } from '../generated/prisma/client.js';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(): Promise<Profile> {
    const profile = await this.prisma.profile.findFirst({
      orderBy: { id: 'asc' },
    });

    if (profile === null) {
      throw new NotFoundException(
        'Профиль не найден. Заполните базу командой: npm run db:seed',
      );
    }

    return profile;
  }

  async update(data: Prisma.ProfileUpdateInput): Promise<Profile> {
    const current = await this.findOne();

    return this.prisma.profile.update({
      where: { id: current.id },
      data,
    });
  }
}
