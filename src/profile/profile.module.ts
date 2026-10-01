import { Module } from '@nestjs/common';
import { ExperienceModule } from '../experience/experience.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProjectModule } from '../project/project.module.js';
import { SkillModule } from '../skill/skill.module.js';
import { ProfileResolver } from './profile.resolver.js';
import { ProfileService } from './profile.service.js';

@Module({
  imports: [PrismaModule, SkillModule, ExperienceModule, ProjectModule],
  providers: [ProfileResolver, ProfileService],
})
export class ProfileModule {}
