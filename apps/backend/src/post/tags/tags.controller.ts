import { Body, Controller, Delete, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ITagCreate } from '@TomikaArome/common';

@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Get()
  async list() {
    return await this.tagsService.list();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.tagsService.getById(id);
  }

  @Post()
  async create(@Body() body: ITagCreate) {
    return await this.tagsService.create(body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.tagsService.delete(id);
  }
}
