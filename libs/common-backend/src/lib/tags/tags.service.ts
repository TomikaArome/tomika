import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tag, TagDocument, TagModel } from './tag.schema';
import { ITagCreate, ITagUpdate, TmkErrNotFound } from '@TomikaArome/common';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: TagModel) {}

  async list(): Promise<TagDocument[]> {
    return this.tagModel.find();
  }

  async getById(id: string): Promise<TagDocument> {
    const tag = await this.tagModel.findById(id);
    if (!tag) {
      throw new TmkErrNotFound({ collection: 'tags', path: '_id', value: id });
    }
    return tag;
  }

  async getByLabel(label: string): Promise<TagDocument> {
    const tag = await this.tagModel.findOne({ label });
    if (!tag) {
      throw new TmkErrNotFound({ collection: 'tags', path: 'label', value: label });
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
    const tag = await this.getById(id);
    await tag.deleteOne();
  }

  async createOrGetTags(arr: (string | ITagCreate)[]): Promise<TagDocument[]> {
    const tags: TagDocument[] = [];
    for (const el of arr) {
      const tag: TagDocument = (typeof el === 'string') ? (await this.getById(el)) : (await this.create(el));
      tags.push(tag);
    }
    return tags;
  }
}
