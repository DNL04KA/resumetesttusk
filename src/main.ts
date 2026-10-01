import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const port = app.get(ConfigService).get<number>('PORT') ?? 3000;
  await app.listen(port);

  new Logger('Bootstrap').log(`Приложение слушает http://localhost:${port}`);
}

await bootstrap();
