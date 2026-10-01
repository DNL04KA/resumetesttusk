import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProjectService } from './project.service.js';

@Module({
  imports: [PrismaModule],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
