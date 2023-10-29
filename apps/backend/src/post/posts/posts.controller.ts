import { Body, Controller, Delete, Get, Param, Post as HttpPost, Put, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { IPostCreate, IPostLatestRevision, IPostRevisionCreate, IPostUpdate } from '@TomikaArome/common';
import { PostDocument } from './post.schema';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  private async formatPost(post: PostDocument, populate = ''): Promise<IPostLatestRevision> {
    const populateTags = populate?.split(',').includes('tags') ?? false;
    populateTags ? await post.populate('tags') : post.depopulate('tags');
    return {
      _id: post._id.toString(),
      title: post.title,
      content: post.content,
      submittedAt: post.submittedAt,
      lastModifiedAt: post.lastModifiedAt,
      tags: post.tags
    };
  }

  @Get()
  async list(@Query('populate') populate: string) {
    return await Promise.all((await this.postsService.list())
      .map((post: PostDocument) => this.formatPost(post, populate)));
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Query('populate') populate: string) {
    const post = await this.postsService.getById(id);
    return await this.formatPost(post, populate);
  }

  @HttpPost()
  async create(@Body() body: IPostCreate, @Query('populate') populate: string) {
    return await this.formatPost(await this.postsService.create(body), populate);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: IPostUpdate, @Query('populate') populate: string) {
    return await this.formatPost(await this.postsService.update(id, body), populate);
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
