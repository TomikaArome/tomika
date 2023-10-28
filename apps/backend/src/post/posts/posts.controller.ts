import { Body, Controller, Delete, Get, Param, Post as HttpPost, Put } from '@nestjs/common';
import { PostsService } from './posts.service';
import { IPostCreate, IPostUpdate } from '@TomikaArome/common';

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

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: IPostUpdate) {
    return await this.postsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.postsService.delete(id);
  }
}
