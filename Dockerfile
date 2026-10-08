# ---------- этап сборки ----------
FROM node:22-alpine AS builder

WORKDIR /app

# package-lock.json сгенерирован npm 12; npm 10 из базового образа
# раскладывает peer-зависимости иначе и спотыкается на `npm ci`.
RUN npm i -g npm@12.1.0

# Сначала только манифесты: слой с зависимостями переиспользуется,
# пока package.json и package-lock.json не изменились.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json prisma7.config.ts ./
COPY prisma ./prisma
COPY src ./src

# Клиент Prisma не хранится в git — генерируем из схемы.
RUN npx prisma generate
RUN npm run build

# ---------- этап запуска ----------
FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN npm i -g npm@12.1.0

COPY package.json package-lock.json ./
# Только production-зависимости: prisma CLI, tsx и прочий инструментарий
# в рантайме не нужны — миграции выполняет отдельный сервис.
RUN npm ci --omit=dev && npm cache clean --force && chown node:node /app

# Скомпилированное приложение вместе со сгенерированным клиентом Prisma.
COPY --from=builder --chown=node:node /app/dist ./dist

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]
