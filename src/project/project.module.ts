import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProjectResolver } from './project.resolver.js';
import { ProjectService } from './project.service.js';

@Module({
  imports: [PrismaModule],
  providers: [ProjectResolver, ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
