import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { ValidationErrorFilter } from './exception-filters/validation-error.filter';

import { environment } from './environments/environment';
import * as fs from 'fs';
import { TmkErrFilter } from './exception-filters/tmk-err.filter';
import { MongoErrorFilter } from './exception-filters/mongo-error.filter';

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
  app.useGlobalFilters(new MongoErrorFilter(), new ValidationErrorFilter(), new TmkErrFilter());
  const port = environment.port || 3333;
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();
