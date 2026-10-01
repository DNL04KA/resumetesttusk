import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { SkillCategory } from '../src/generated/prisma/enums.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const PROFILE_EMAIL = 'dev@example.com';

async function main(): Promise<void> {
  const profile = await prisma.profile.upsert({
    where: { email: PROFILE_EMAIL },
    update: {},
    create: {
      name: 'Иван Разработчиков',
      position: 'Backend Developer',
      description:
        'Разрабатываю серверные приложения на TypeScript и Node.js. Интересуюсь базами данных и проектированием API.',
      email: PROFILE_EMAIL,
      location: 'Москва',
      githubUrl: 'https://github.com/example',
      websiteUrl: 'https://example.com',
      telegram: '@example',
    },
  });

  await prisma.skill.deleteMany({ where: { profileId: profile.id } });
  await prisma.skill.createMany({
    data: [
      { name: 'TypeScript', category: SkillCategory.LANGUAGE, level: 4, profileId: profile.id },
      { name: 'JavaScript', category: SkillCategory.LANGUAGE, level: 4, profileId: profile.id },
      { name: 'SQL', category: SkillCategory.LANGUAGE, level: 3, profileId: profile.id },
      { name: 'NestJS', category: SkillCategory.FRAMEWORK, level: 4, profileId: profile.id },
      { name: 'GraphQL', category: SkillCategory.FRAMEWORK, level: 3, profileId: profile.id },
      { name: 'PostgreSQL', category: SkillCategory.DATABASE, level: 3, profileId: profile.id },
      { name: 'Prisma', category: SkillCategory.DATABASE, level: 3, profileId: profile.id },
      { name: 'Docker', category: SkillCategory.TOOL, level: 3, profileId: profile.id },
      { name: 'Git', category: SkillCategory.TOOL, level: 4, profileId: profile.id },
    ],
  });

  await prisma.experience.deleteMany({ where: { profileId: profile.id } });
  await prisma.experience.createMany({
    data: [
      {
        company: 'ООО «Пример»',
        position: 'Junior Backend Developer',
        description:
          'Поддержка и доработка REST API на Node.js, написание SQL-запросов, участие в код-ревью.',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-08-31'),
        profileId: profile.id,
      },
      {
        company: 'Фриланс',
        position: 'Backend Developer',
        description:
          'Разработка backend-части небольших сервисов: проектирование схемы БД, GraphQL API, деплой в Docker.',
        startDate: new Date('2025-09-01'),
        endDate: null,
        profileId: profile.id,
      },
    ],
  });

  await prisma.project.deleteMany({ where: { profileId: profile.id } });
  await prisma.project.createMany({
    data: [
      {
        name: 'Digital Business Card',
        description:
          'GraphQL API цифровой визитки разработчика: профиль, навыки, опыт и проекты.',
        technologies: ['TypeScript', 'NestJS', 'GraphQL', 'Prisma', 'PostgreSQL', 'Docker'],
        repoUrl: 'https://github.com/example/digital-card',
        demoUrl: null,
        profileId: profile.id,
      },
      {
        name: 'Task Tracker API',
        description:
          'REST API для учёта задач с аутентификацией по JWT и ролевой моделью доступа.',
        technologies: ['TypeScript', 'NestJS', 'PostgreSQL'],
        repoUrl: 'https://github.com/example/task-tracker',
        demoUrl: null,
        profileId: profile.id,
      },
      {
        name: 'Currency Rates Bot',
        description:
          'Telegram-бот, который отдаёт курсы валют по расписанию и хранит историю запросов.',
        technologies: ['Node.js', 'TypeScript', 'PostgreSQL'],
        repoUrl: 'https://github.com/example/rates-bot',
        demoUrl: null,
        profileId: profile.id,
      },
    ],
  });

  const stats = {
    profileId: profile.id,
    skills: await prisma.skill.count({ where: { profileId: profile.id } }),
    experiences: await prisma.experience.count({ where: { profileId: profile.id } }),
    projects: await prisma.project.count({ where: { profileId: profile.id } }),
  };
  console.log('Seed выполнен:', stats);
}

main()
  .catch((error: unknown) => {
    console.error('Seed упал с ошибкой:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
