import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModel, PostRevision, PostRevisionModel } from './post.schema';
import { IPostCreate, IPostUpdate, ITagCreate, TmkErrNotFound } from '@TomikaArome/common';
import { TagsService } from '../tags/tags.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: PostModel,
    @InjectModel(PostRevision.name) private postRevisionModel: PostRevisionModel,
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
      newPost.tags = await this.tagsService.createOrGetTags(data.tags);
    }
    return newPost.save();
  }

  async update(id: string, data: IPostUpdate): Promise<PostDocument> {
    const post = await this.getById(id);
    if ((data.title || data.content) && (data.title !== post.title || data.content !== post.content)) {
      const newPostRevision = new this.postRevisionModel({
        title: data.title || post.title,
        content: data.content || post.content
      });
      post.revisions.push(newPostRevision);
    }
    if (data.tags) {
      post.tags = await this.tagsService.createOrGetTags(data.tags);
    }
    return post.save();
  }

  async delete(id: string): Promise<void> {
    const post = await this.getById(id);
    await post.deleteOne();
  }
}
