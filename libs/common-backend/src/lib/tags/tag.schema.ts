import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ITag, TAG_LABEL_MAX_LENGTH, TAG_LABEL_MIN_LENGTH, TAG_LABEL_REGEX } from '@TomikaArome/common';

export type TagModel = Model<Tag>;
export type TagDocument = HydratedDocument<Tag>;

@Schema()
export class Tag implements ITag {
  @Prop({
    required: true,
    minlength: TAG_LABEL_MIN_LENGTH,
    maxlength: TAG_LABEL_MAX_LENGTH,
    match: TAG_LABEL_REGEX,
    unique: true,
    lowercase: true
  })
  label: string;
}

export const tagSchema = SchemaFactory.createForClass(Tag);
