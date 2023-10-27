import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostRevision } from './post.schema';
import { Model } from 'mongoose';
import { IPostCreate, ITagCreate, TmkErrNotFound } from '@TomikaArome/common';
import { TagsService } from '../tags/tags.service';
import { Tag, TagDocument } from '../tags/tag.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(PostRevision.name) private postRevisionModel: Model<PostRevision>,
    private tagsService: TagsService
  ) {}

  async list(): Promise<PostDocument[]> {
    return this.postModel.find();
  }

  async getById(id: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new TmkErrNotFound({ collection: 'posts', path: '_id', value: id });
    }
    return post;
  }

  async create(data: IPostCreate): Promise<PostDocument> {
    const newPostRevision = new this.postRevisionModel({
      title: data.title,
      content: data.content
    });
    const newPost = new this.postModel({
      revisions: [newPostRevision]
    });
    if (data.tags) {
      for (const el of data.tags) {
        const tag: TagDocument = (typeof el === 'string') ? (await this.tagsService.getById(el)) : (await this.tagsService.create(el));
        newPost.tags.push(tag);
      }
    }
    return newPost.save();
  }

  async delete(id: string): Promise<void> {
    const post = await this.getById(id);
    await post.deleteOne();
  }
}
