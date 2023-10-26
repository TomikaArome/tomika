import { HydratedDocument } from 'mongoose';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { IPost, IPostRevision } from '@TomikaArome/common';
import { Tag } from '../tags/tag.schema';

export type PostDocument = HydratedDocument<Post>

@Schema()
export class Post implements IPost {
  @Prop({ type: [raw({
      title: String,
      content: String,
      submittedAt: Date
    })] })
  revisions: IPostRevision[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] })
  tags: Tag[];
}

export const postSchema = SchemaFactory.createForClass(Post);
