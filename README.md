# Digital Business Card API

GraphQL API цифровой визитки разработчика: профиль, навыки, опыт работы и проекты.

## Стек

TypeScript · NestJS 12 · GraphQL (Apollo Server 5) · Prisma 7 · PostgreSQL 16 · Docker

## Архитектура

```
GraphQL Resolver  →  DataLoader  →  Service  →  Prisma  →  PostgreSQL
```

- **Resolver** — транспортный слой: принимает запрос, передаёт аргументы дальше. Prisma не вызывает.
- **DataLoader** — батчинг связанных сущностей, только для relation-полей.
- **Service** — бизнес-логика и доступ к данным через Prisma.
- **PrismaService** — обёртка над `PrismaClient` с подключением и graceful shutdown.

Код разбит по доменам (`profile`, `skill`, `experience`, `project`), каждый домен — отдельный модуль NestJS.

## Структура

```
prisma/
  schema.prisma          модели и связи
  migrations/            SQL-миграции
  seed.ts                идемпотентное наполнение базы
src/
  main.ts                точка входа, ValidationPipe, shutdown hooks
  app.module.ts          корневой модуль, конфигурация GraphQL
  common/
    sort-order.enum.ts   GraphQL enum ASC | DESC
    format-graphql-error.ts  перевод исключений Nest в коды GraphQL
  prisma/                PrismaService + PrismaModule
  profile/               резолвер, сервис, ObjectType, InputType
  skill/                 сервис, loader, ObjectType
  experience/            сервис, loader, ObjectType
  project/               резолвер, сервис, loader, ObjectType
Dockerfile
docker-compose.yml
```

## Модель данных

```
Profile 1 ──< Skill
        1 ──< Experience
        1 ──< Project
```

Все связи — One-to-Many с `onDelete: Cascade`. На внешних ключах созданы индексы (PostgreSQL не создаёт их автоматически).

## Локальный запуск

Нужны Node.js 20+ и запущенный PostgreSQL.

```bash
npm ci
cp .env.example .env          # укажите свою строку подключения
createdb devcard
npm run db:migrate
npm run db:generate
npm run db:seed
npm run start:dev
```

Приложение поднимается на `http://localhost:3000`.

## Запуск через Docker Compose

```bash
docker compose up --build
```

Поднимаются три сервиса:

| Сервис | Назначение |
|---|---|
| `db` | PostgreSQL 16, healthcheck через `pg_isready`, данные в volume `pgdata` |
| `migrate` | разовая задача: `prisma migrate deploy` + `prisma db seed`, затем завершается |
| `app` | приложение, стартует только после успешного `migrate` |

Порт PostgreSQL наружу — **5433**, чтобы не конфликтовать с локально установленным сервером.

Полный перезапуск с чистой базой:

```bash
docker compose down -v && docker compose up --build
```

## Миграции

```bash
npm run db:migrate     # создать и применить миграцию (разработка)
npm run db:deploy      # применить существующие миграции (Docker, прод)
npm run db:generate    # пересобрать Prisma Client после правки схемы
npm run db:reset       # пересоздать базу и применить всё заново
```

После изменения `schema.prisma` нужны обе команды: `db:migrate` и `db:generate` — в Prisma 7 миграция больше не генерирует клиент автоматически.

## Seed

```bash
npm run db:seed
```

Скрипт идемпотентен: профиль обновляется через `upsert` по уникальному `email`, дочерние сущности пересоздаются. Повторный запуск не дублирует данные.

## GraphQL

Endpoint: `POST /graphql`
Apollo Sandbox: `http://localhost:3000/graphql` в браузере.

Схема генерируется из TypeScript-классов (code-first) и сохраняется в [schema.gql](schema.gql).

### Основные запросы

```graphql
# профиль со всеми связями
query {
  profile {
    name
    position
    skills { name category level }
    experience { company position startDate endDate }
    projects { name technologies repoUrl }
  }
}

# список профилей
query {
  profiles { id name skills { name } }
}

# проект по идентификатору
query {
  project(id: 4) { name description technologies }
}

# фильтр проектов по технологии (точное совпадение, с учётом регистра)
query {
  projects(technology: "NestJS") { name technologies }
}

# сортировка опыта работы
query {
  profile {
    experience(order: ASC) { company startDate }
  }
}
```

### Мутация

```graphql
mutation {
  updateProfile(input: { position: "Mobile Developer", location: "Минск" }) {
    name
    position
    location
    updatedAt
  }
}
```

Все поля `UpdateProfileInput` необязательны — не переданные поля не затрагиваются. Входные данные проверяются `class-validator` (`@IsEmail`, `@IsUrl`, `@IsNotEmpty`).

## Обработка ошибок

Исключения NestJS переводятся в прикладные коды GraphQL в [format-graphql-error.ts](src/common/format-graphql-error.ts). Из ответа убираются `stacktrace` и внутренние поля.

| Ситуация | HTTP | `extensions.code` |
|---|---|---|
| поля нет в схеме | 400 | `GRAPHQL_VALIDATION_FAILED` |
| невалидный аргумент или input | 200 | `BAD_USER_INPUT` |
| запись не найдена | 200 | `NOT_FOUND` |

HTTP 400 возвращается только когда запрос не прошёл проверку схемой — то есть до выполнения резолверов. Ошибки времени выполнения по спецификации GraphQL-over-HTTP отдаются со статусом 200 и заполненным массивом `errors`.

Ошибки валидации приходят списком в `extensions.validationErrors`.

## DataLoader и проблема N+1

Связи профиля (`skills`, `experience`, `projects`) резолвятся через `@ResolveField`. Это даёт ленивость — незапрошенные связи не вызывают запросов к базе, — но при списке профилей порождает N+1: по одному запросу на каждую связь каждого профиля.

Решение — `DataLoader` на каждую связь. Обращения, сделанные в рамках одного GraphQL-запроса, собираются в один `WHERE profileId IN (...)`, результат группируется по владельцам и раздаётся в порядке ключей.

Loader'ы объявлены с `Scope.REQUEST`: экземпляр и его кэш живут ровно один запрос, что исключает отдачу устаревших или чужих данных.

### Измеренный эффект

Один и тот же запрос на 4 профилях:

```graphql
query {
  profiles { id name skills { name } experience { company } projects { name } }
}
```

| | SQL-запросов |
|---|---|
| прямые вызовы сервисов | **13** = 1 + 3×4 |
| через DataLoader | **4** = 1 + 3 |

```sql
-- было: 1 + 3N
SELECT ... FROM "Profile"
SELECT ... FROM "Skill"      WHERE "profileId" = $1     -- ×4
SELECT ... FROM "Experience" WHERE "profileId" = $1     -- ×4
SELECT ... FROM "Project"    WHERE "profileId" = $1     -- ×4

-- стало: 1 + 3
SELECT ... FROM "Profile"
SELECT ... FROM "Skill"      WHERE "profileId" IN ($1,$2,$3,$4)
SELECT ... FROM "Experience" WHERE "profileId" IN ($1,$2,$3,$4)
SELECT ... FROM "Project"    WHERE "profileId" IN ($1,$2,$3,$4)
```

Число запросов перестало зависеть от размера списка. Ленивость сохранена: `profiles { id name }` по-прежнему выполняет один запрос.

Увидеть SQL можно, запустив приложение с `PRISMA_LOG_QUERIES=true`.

## Тесты

```bash
npm test
```

Юнит-тесты loader'ов: группировка строк по владельцам, порядок ключей, пустой результат и проверка того, что сортировка `ASC` не мутирует кэш DataLoader. Базы данных не требуют.

## Технические решения

- **GraphQL вместо REST** — резюме это дерево связанных сущностей, клиент сам выбирает нужные поля за один запрос.
- **Отдельные GraphQL-типы, а не Prisma-модели** — публичный контракт API отделён от структуры базы: изменение схемы БД не ломает клиентов, служебные поля наружу не попадают.
- **`@ResolveField` + DataLoader вместо `include`** — `include` грузил бы связи всегда, даже когда клиент их не запросил.
- **`technologies` как массив строк, а не отдельная таблица** — свободные теги без собственного жизненного цикла. Платой стала чувствительность фильтра к регистру и отсутствие справочника; при появлении атрибутов у технологии потребуется модель `Technology` и связь many-to-many.
- **`endDate` nullable** — `null` означает «работает по настоящее время», а не отсутствие данных.
- **Миграции отдельным сервисом Compose** — разовая задача не должна выполняться в каждой реплике приложения.
- **Prisma 7 с driver adapter `@prisma/adapter-pg`** — в седьмой версии подключение идёт через обычный драйвер `pg`.

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | строка подключения к PostgreSQL |
| `PORT` | порт HTTP-сервера, по умолчанию 3000 |
| `PRISMA_LOG_QUERIES` | `true` — логировать SQL-запросы |

Шаблон — в [.env.example](.env.example). Файл `.env` в репозиторий не коммитится.
