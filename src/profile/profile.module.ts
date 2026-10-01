import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SkillModule } from '../skill/skill.module.js';
import { ProfileResolver } from './profile.resolver.js';
import { ProfileService } from './profile.service.js';

@Module({
  imports: [PrismaModule, SkillModule],
  providers: [ProfileResolver, ProfileService],
})
export class ProfileModule {}
