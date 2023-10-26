import { Module } from '@nestjs/common';
import { environment } from '../environments/environment';

import { MongooseModule } from '@nestjs/mongoose';
import { OuistitiModule } from '@TomikaArome/ouistiti';
import { TagsModule } from '../post/tags/tags.module';

import { AppController } from './app.controller';

import { AppService } from './app.service';

@Module({
  imports: [
    OuistitiModule,
    MongooseModule.forRoot(environment.mongodbConnectionString, {
      dbName: environment.mongodbDatabase
    }),
    TagsModule
  ],
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
