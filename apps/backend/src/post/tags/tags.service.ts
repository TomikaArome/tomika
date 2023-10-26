import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tag } from './tag.schema';
import { Model } from 'mongoose';
import { ITagCreate, ITagUpdate, TmkErrNotFound } from '@TomikaArome/common';
import { TmkErrConflict } from '@TomikaArome/common';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<Tag>) {}

  async list(): Promise<Tag[]> {
    return this.tagModel.find();
  }

  async getById(id: string): Promise<Tag> {
    return this.tagModel.findById(id);
  }

  async getByLabel(label: string, throwOnNotFound = true): Promise<Tag> {
    return this.tagModel.findOne({ label });
  }

  async create(data: ITagCreate): Promise<Tag> {
    TmkErrConflict.throwOnConflict(await this.getByLabel(data.label), { collection: 'tags', propertyName: 'label', value: data.label });
    const newTag = new this.tagModel(data);
    return newTag.save();
  }

  async update(id: string, data: ITagUpdate): Promise<Tag> {
    if (data.label) {
      TmkErrConflict.throwOnConflict(await this.getByLabel(data.label), { collection: 'tags', propertyName: 'label', value: data.label });
    }
    const query = await this.tagModel.findByIdAndUpdate(id, { label: data.label });
    TmkErrNotFound.throwOnNotFound(query, { collection: 'tags', propertyName: '_id', value: id });
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const query = await this.tagModel.findByIdAndDelete(id);
    TmkErrNotFound.throwOnNotFound(query, { collection: 'tags', propertyName: '_id', value: id });
  }
}
