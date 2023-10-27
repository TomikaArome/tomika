import { Body, Controller, Delete, Get, Param, Post as HttpPost } from '@nestjs/common';
import { PostsService } from './posts.service';
import { IPostCreate } from '@TomikaArome/common';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  async list() {
    return await this.postsService.list();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.postsService.getById(id);
  }

  @HttpPost()
  async create(@Body() body: IPostCreate) {
    return await this.postsService.create(body);
  }

  @Delete(':id')
  async update(@Param('id') id: string) {
    await this.postsService.delete(id);
  }
}
