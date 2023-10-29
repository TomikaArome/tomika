import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { IPost, IPostRevision } from '@TomikaArome/common';
import { Tag } from '../tags/tag.schema';

export interface PostVirtuals {
  get currentRevision(): PostRevision;
  get title(): string;
  get content(): string;
  get lastModifiedAt(): Date;
  get submittedAt(): Date;
}
export type PostModel = Model<Post, {}, PostVirtuals>;
export type PostRevisionModel = Model<PostRevision>;
export type PostRevisionDocument = HydratedDocument<PostRevision>;
export type PostDocument = HydratedDocument<Post, PostVirtuals>;

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

export const postRevisionSchema = SchemaFactory.createForClass(PostRevision);

@Schema()
export class Post implements IPost {
  @Prop([PostRevision])
  revisions: PostRevision[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] })
  tags: Tag[];
}

export const postSchema = SchemaFactory.createForClass(Post);

postSchema.virtual('currentRevision').get(function() {
  return this.revisions.reduce((acc: PostRevision, curr: PostRevision) => {
    return acc === null ? curr : (+acc.submittedAt > +curr.submittedAt ? acc : curr);
  }, null);
});

postSchema.virtual('title').get(function() {
  return (this.get('currentRevision') as PostRevisionDocument).title;
});

postSchema.virtual('content').get(function() {
  return (this.get('currentRevision') as PostRevisionDocument).content;
});

postSchema.virtual('lastModifiedAt').get(function() {
  return (this.get('currentRevision') as PostRevisionDocument).submittedAt;
});

postSchema.virtual('submittedAt').get(function() {
  return (this.revisions.reduce((acc: PostRevision, curr: PostRevision) => {
    return acc === null ? curr : (+acc.submittedAt > +curr.submittedAt ? acc : curr);
  }, null)).submittedAt;
});
