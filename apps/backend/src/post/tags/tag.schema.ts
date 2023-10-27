import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ITag, TAG_LABEL_MAX_LENGTH, TAG_LABEL_MIN_LENGTH, TAG_LABEL_REGEX } from '@TomikaArome/common';

export type TagDocument = HydratedDocument<Tag>;

@Schema()
export class Tag implements ITag {
  @Prop({
    minlength: TAG_LABEL_MIN_LENGTH,
    maxlength: TAG_LABEL_MAX_LENGTH,
    match: TAG_LABEL_REGEX
  })
  label: string;
}

export const tagSchema = SchemaFactory.createForClass(Tag);
