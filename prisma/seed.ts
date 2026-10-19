import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { SkillCategory } from '../src/generated/prisma/enums.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const PROFILE_EMAIL = 'nesterovichds0512@gmail.com';

async function main(): Promise<void> {
  const profile = await prisma.profile.upsert({
    where: { email: PROFILE_EMAIL },
    update: {},
    create: {
      name: 'Даниил Нестерович',
      position: 'Мобильный разработчик (iOS / Android)',
      description:
        'Мобильный разработчик под iOS и Android. Пишу на Swift, Kotlin и Flutter, выпускал релизы в App Store и Google Play, работал с подписками и платежами на iOS. Умею разбираться в чужой кодовой базе и доводить фичу от API до релиза.',
      email: PROFILE_EMAIL,
      location: 'Минск',
      githubUrl: 'https://github.com/DNL04KA',
      websiteUrl: null,
      telegram: 'https://t.me/dnl04ka',
    },
  });

  await prisma.skill.deleteMany({ where: { profileId: profile.id } });
  await prisma.skill.createMany({
    data: [
      { name: 'Swift', category: SkillCategory.LANGUAGE, level: 4, profileId: profile.id },
      { name: 'Kotlin', category: SkillCategory.LANGUAGE, level: 4, profileId: profile.id },
      { name: 'TypeScript', category: SkillCategory.LANGUAGE, level: 3, profileId: profile.id },
      { name: 'Python', category: SkillCategory.LANGUAGE, level: 3, profileId: profile.id },
      { name: 'SwiftUI', category: SkillCategory.FRAMEWORK, level: 3, profileId: profile.id },
      { name: 'Jetpack Compose', category: SkillCategory.FRAMEWORK, level: 4, profileId: profile.id },
      { name: 'Flutter / Dart', category: SkillCategory.FRAMEWORK, level: 4, profileId: profile.id },
      { name: 'React / Next.js', category: SkillCategory.FRAMEWORK, level: 3, profileId: profile.id },
      { name: 'PostgreSQL', category: SkillCategory.DATABASE, level: 3, profileId: profile.id },
      { name: 'Git', category: SkillCategory.TOOL, level: 4, profileId: profile.id },
      { name: 'REST API', category: SkillCategory.TOOL, level: 4, profileId: profile.id },
      { name: 'MVVM', category: SkillCategory.TOOL, level: 4, profileId: profile.id },
      { name: 'Claude Code / Codex', category: SkillCategory.TOOL, level: 4, profileId: profile.id },
    ],
  });

  await prisma.experience.deleteMany({ where: { profileId: profile.id } });
  await prisma.experience.createMany({
    data: [
      {
        company: 'Sport TV',
        position: 'Mobile Developer',
        description:
          'Развитие приложения для спортивного стриминга на Flutter под iOS и Android.',
        achievements: [
          'В одиночку разработал с нуля нативный клиент для Android TV — платформы, на которой смотрит основная аудитория сервиса: архитектура MVVM, плеер на Media3, сетевой слой с переподключением при обрывах связи',
          'Исправил некорректную работу подписок на iOS, включая сценарий отмены: разбирал логику в нативном Swift, проверял на реальных устройствах и вместе с бэкендом устранил расхождения между статусом подписки в приложении и на сервере',
          'Регулярно выпускал релизы в App Store и Google Play: готовил сборки, проверял перед публикацией, выпускал пострелизные исправления',
          'Развивал Flutter-приложение под iOS и Android и интегрировал его с бэкендом по REST API, разбираясь в существующей кодовой базе',
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-08-31'),
        profileId: profile.id,
      },
    ],
  });

  await prisma.project.deleteMany({ where: { profileId: profile.id } });
  await prisma.project.createMany({
    data: [
      {
        name: 'Нативный клиент для Android TV',
        description:
          'Клиент для сервиса sport-tv.by: просмотр спортивных трансляций на Android TV с управлением с пульта. Сделан в одиночку с нуля — архитектура MVVM, видеоплеер на Media3, сетевой слой с переподключением при обрывах сети.',
        technologies: [
          'Kotlin',
          'Compose for TV',
          'Media3 / ExoPlayer',
          'Hilt',
          'Coroutines',
          'Retrofit',
        ],
        repoUrl: 'https://github.com/DNL04KA/svoisport',
        demoUrl: null,
        profileId: profile.id,
      },
      {
        name: 'MAPA (в разработке)',
        description:
          'iOS-приложение для путешественников. На карте мира закрашиваются посещённые страны, есть маршруты по странам, в планах подписка MAPA+.',
        technologies: ['Swift', 'SwiftUI'],
        repoUrl: 'https://github.com/DNL04KA/mapa',
        demoUrl: null,
        profileId: profile.id,
      },
      {
        name: 'Askbase',
        description:
          'SaaS-конструктор AI-чатботов. Компания загружает документы и получает чат-бота для своего сайта, который отвечает по этим документам.',
        technologies: [
          'Next.js',
          'TypeScript',
          'React',
          'Supabase',
          'PostgreSQL',
          'OpenAI API',
        ],
        repoUrl: 'https://github.com/DNL04KA/askbase',
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
