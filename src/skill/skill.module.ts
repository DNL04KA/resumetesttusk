import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SkillService } from './skill.service.js';

@Module({
  imports: [PrismaModule],
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}
