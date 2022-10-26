/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as dotenvConfig } from 'dotenv';

import { AppModule } from './app/app.module';

import { environment } from './environments/environment';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = environment.production
    ? {
        httpsOptions: {
          key: fs.readFileSync('./secrets/private-key.pem'),
          cert: fs.readFileSync('./secrets/public-certificate.pem'),
        },
      }
    : {};

  dotenvConfig();
  const app = await NestFactory.create(AppModule, { ...httpsOptions });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 443;
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();
