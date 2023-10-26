import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './post.schema';
import { Model } from 'mongoose';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async list(): Promise<Post[]> {
    return this.postModel.find();
  }

  async getById(id: string): Promise<Post> {
    return this.postModel.findById(id);
  }

  async create(data): Promise<Post> {
    const newPost = new this.postModel(data);
    return newPost.save();
  }

  async delete(id: string): Promise<boolean> {
    return !!(await this.postModel.findByIdAndDelete(id));
  }
}
