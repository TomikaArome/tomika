import { HydratedDocument } from 'mongoose';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { IPost, IPostRevision } from '@TomikaArome/common';
import { Tag } from '../tags/tag.schema';

export type PostRevisionDocument = HydratedDocument<PostRevision>;
export type PostDocument = HydratedDocument<Post>;

@Schema({ _id: false })
export class PostRevision implements IPostRevision {
  @Prop({
    required: true
  })
  title: string;

  @Prop({
    required: true
  })
  content: string;

  @Prop({
    default: Date.now
  })
  submittedAt: Date;
}

@Schema()
export class Post implements IPost {
  @Prop([PostRevision])
  revisions: PostRevision[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] })
  tags: Tag[];
}

export const postRevisionSchema = SchemaFactory.createForClass(PostRevision);
export const postSchema = SchemaFactory.createForClass(Post);
