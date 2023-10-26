import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, tagSchema } from './tag.schema';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tag.name, schema: tagSchema }])],
  controllers: [TagsController],
  providers: [TagsService]
})
export class TagsModule {}
