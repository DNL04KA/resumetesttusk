import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ExperienceLoader } from './experience.loader.js';
import { ExperienceService } from './experience.service.js';

@Module({
  imports: [PrismaModule],
  providers: [ExperienceService, ExperienceLoader],
  exports: [ExperienceService, ExperienceLoader],
})
export class ExperienceModule {}
