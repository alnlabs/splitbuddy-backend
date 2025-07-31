import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiProperty } from '@nestjs/swagger';

class CreateCategoryDto {
  @ApiProperty() name: string;
  @ApiProperty({ required: false }) authorId?: string;
}

class UpdateCategoryDto {
  @ApiProperty({ required: false }) name?: string;
}

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.categoryService.getById(id);
  }

  @Get()
  async list() {
    return this.categoryService.list();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
