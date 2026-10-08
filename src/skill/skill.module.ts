import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SkillLoader } from './skill.loader.js';
import { SkillService } from './skill.service.js';

@Module({
  imports: [PrismaModule],
  providers: [SkillService, SkillLoader],
  exports: [SkillService, SkillLoader],
})
export class SkillModule {}
