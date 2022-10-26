import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { OuistitiModule } from '@TomikaArome/ouistiti';
import { environment } from '../environments/environment';

@Module({
  imports: [OuistitiModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'environment',
      useValue: environment,
    }
  ]
})
export class AppModule {}
