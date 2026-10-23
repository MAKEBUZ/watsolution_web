require('dotenv').config({ path: '.env' });
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';

import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { config } from './config';
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
  // Disable ETag and prevent index.html from being cached by the browser.
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('etag', false);
  expressApp.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    if (req.path.startsWith('/api/') || req.path === '/' || req.path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
    }
    next();
  });

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
