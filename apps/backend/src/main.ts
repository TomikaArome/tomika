import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

import { environment } from './environments/environment';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = environment.environment === 'production'
    ? {
        httpsOptions: {
          key: fs.readFileSync('./secrets/private-key.pem'),
          cert: fs.readFileSync('./secrets/public-certificate.pem'),
        },
      }
    : {};

  const app = await NestFactory.create(AppModule, { ...httpsOptions });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = environment.port || 3333;
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();
