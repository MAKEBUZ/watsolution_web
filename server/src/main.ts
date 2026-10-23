require('dotenv').config({ path: '.env' });
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';

import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { config } from './config';
import { configureHttpSecurity } from './security/http-security';
const logger: Logger = new Logger('Main');
const port = process.env.PORT || process.env.NODE_SERVER_PORT || config.get('server.port');


async function bootstrap(): Promise<void> {



  const appOptions = { rawBody: true, cors: { origin: (process.env.WEB_ORIGINS ?? '').split(',').map(v => v.trim()).filter(Boolean), credentials: true, exposedHeaders: ['Authorization'] } };
  const app = await NestFactory.create(AppModule, appOptions);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (): BadRequestException => new BadRequestException('Validation error'),
      // https://github.com/nestjs/nest/issues/10683#issuecomment-1349614194
      forbidUnknownValues: false,
    }),
  );
  configureHttpSecurity(app.getHttpAdapter().getInstance());

  const staticClientPath = config.getClientPath();
  if (fs.existsSync(staticClientPath)) {
    logger.log(`Serving static client resources on ${staticClientPath}`);
  } else {
    logger.log(`No client it has been found`);
  }
  setupSwagger(app);

  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap();
