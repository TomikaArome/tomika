import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tag } from './tag.schema';
import { Model } from 'mongoose';
import { ITagCreate, TmkErrNotFound } from '@TomikaArome/common';
import { TmkErrConflict } from '@TomikaArome/common';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<Tag>) {}

  async list(): Promise<Tag[]> {
    return this.tagModel.find();
  }

  async getById(id: string): Promise<Tag> {
    const query = await this.tagModel.findById(id);
    if (!query) {
      throw new TmkErrNotFound({
        collection: 'tags',
        propertyName: '_id',
        value: id
      });
    }
    return query;
  }

  async getByLabel(label: string): Promise<Tag> {
    const query = await this.tagModel.findOne({ label });
    if (!query) {
      throw new TmkErrNotFound({
        collection: 'tags',
        propertyName: 'label',
        value: label
      });
    }
    return query;
  }

  async create(data: ITagCreate): Promise<Tag> {
    const conflictingTag = await this.tagModel.findOne({ label: data.label });
    if (conflictingTag) {
      throw new TmkErrConflict({
        collection: 'tags',
        propertyName: 'label',
        value: data.label
      });
    }
    const newTag = new this.tagModel(data);
    return newTag.save();
  }

  async delete(id: string): Promise<void> {
    const query = await this.tagModel.findByIdAndDelete(id);
    if (!query) {
      throw new TmkErrNotFound({
        collection: 'tags',
        propertyName: '_id',
        value: id
      });
    }
  }
}
