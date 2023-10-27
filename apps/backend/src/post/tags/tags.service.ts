import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tag, TagDocument } from './tag.schema';
import { Model } from 'mongoose';
import { ITagCreate, ITagUpdate, TmkErrNotFound } from '@TomikaArome/common';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<Tag>) {}

  async list(): Promise<TagDocument[]> {
    return this.tagModel.find();
  }

  async getById(id: string): Promise<TagDocument> {
    const tag = await this.tagModel.findById(id);
    if (!tag) {
      throw new TmkErrNotFound({ collection: 'tags', propertyName: '_id', value: id });
    }
    return tag;
  }

  async getByLabel(label: string): Promise<TagDocument> {
    const tag = await this.tagModel.findOne({ label });
    if (!tag) {
      throw new TmkErrNotFound({ collection: 'tags', propertyName: 'label', value: label });
    }
    return tag;
  }

  async create(data: ITagCreate): Promise<TagDocument> {
    const newTag = new this.tagModel(data);
    return newTag.save();
  }

  async update(id: string, data: ITagUpdate): Promise<TagDocument> {
    const tag = await this.getById(id);
    if (data.label) { tag.label = data.label; }
    return tag.save();
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.tagModel.findByIdAndDelete(id);
  }
}
