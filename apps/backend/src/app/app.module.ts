import { Module } from '@nestjs/common';
import { environment } from '../environments/environment';
import { Connection as MongooseConnection } from 'mongoose';

import { MongooseModule } from '@nestjs/mongoose';
import { OuistitiModule } from '@TomikaArome/ouistiti';
import { PostsModule, TagsModule } from '@TomikaArome/common-backend';

import { AppController } from './app.controller';

import { AppService } from './app.service';

@Module({
  imports: [
    OuistitiModule,
    MongooseModule.forRoot(environment.mongodbConnectionString, {
      dbName: environment.mongodbDatabase,
      connectionFactory: (connection: MongooseConnection) => {
        // Enable validation for updating in MongoDB by default
        function setRunValidators () {
          this.setOptions({ runValidators: true });
        }

        connection.plugin(schema => {
          schema.pre('findOneAndUpdate', setRunValidators);
          schema.pre('updateMany', setRunValidators);
          schema.pre('updateOne', setRunValidators);
        });
        return connection;
      }
    }),
    TagsModule,
    PostsModule
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
