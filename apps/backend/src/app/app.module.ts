import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { OuistitiModule } from '@TomikaArome/ouistiti';

@Module({
  imports: [OuistitiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
