import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ITagCreate, ITagUpdate, TmkErrNotFound } from '@TomikaArome/common';

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

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: ITagUpdate) {
    return await this.tagsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.tagsService.delete(id);
  }
}
