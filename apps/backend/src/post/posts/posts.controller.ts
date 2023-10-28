import { Body, Controller, Delete, Get, Param, Post as HttpPost, Put } from '@nestjs/common';
import { PostsService } from './posts.service';
import { IPostCreate, IPostRevisionCreate, IPostUpdate } from '@TomikaArome/common';
import { PostDocument } from './post.schema';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  private formatPost(post: PostDocument) {
    post.depopulate('tags');
    return {
      _id: post._id,
      title: post.title,
      content: post.content,
      submittedAt: post.submittedAt,
      lastModifiedAt: post.lastModifiedAt,
      tags: post.tags
    };
  }

  @Get()
  async list() {
    return (await this.postsService.list()).map((post: PostDocument) => this.formatPost(post));
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const post = await this.postsService.getById(id);
    return this.formatPost(post);
  }

  @HttpPost()
  async create(@Body() body: IPostCreate) {
    return await this.postsService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: IPostUpdate) {
    return await this.postsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.postsService.delete(id);
  }

  @Get(':id/revisions')
  async getRevisions(@Param('id') postId: string) {
    const post = await this.postsService.getById(postId);
    return post.revisions;
  }

  @HttpPost(':id/revisions')
  async addNewRevision(@Param('id') postId: string, @Body() body: IPostRevisionCreate) {
    const post = await this.postsService.update(postId, {
      title: body.title,
      content: body.content
    });
    return post.currentRevision;
  }
}
