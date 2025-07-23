import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { ApiProperty } from '@nestjs/swagger';

class CreateGroupDto {
  @ApiProperty() groupName: string;
  @ApiProperty() currency: string;
  @ApiProperty() authorId: string;
}

class UpdateGroupDto {
  @ApiProperty({ required: false }) groupName?: string;
  @ApiProperty({ required: false }) currency?: string;
}

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async create(@Body() dto: CreateGroupDto) {
    return this.groupService.create(dto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.groupService.getById(id);
  }

  @Get()
  async list() {
    return this.groupService.list();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.groupService.delete(id);
  }
}
