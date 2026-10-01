import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ExperienceService } from './experience.service.js';

@Module({
  imports: [PrismaModule],
  providers: [ExperienceService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
