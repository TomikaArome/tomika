import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, postSchema } from './post.schema';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Post.name, schema: postSchema }])],
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule {}
