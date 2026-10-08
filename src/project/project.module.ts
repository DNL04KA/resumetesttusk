import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProjectLoader } from './project.loader.js';
import { ProjectResolver } from './project.resolver.js';
import { ProjectService } from './project.service.js';

@Module({
  imports: [PrismaModule],
  providers: [ProjectResolver, ProjectService, ProjectLoader],
  exports: [ProjectService, ProjectLoader],
})
export class ProjectModule {}
