import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { GroupMemberService } from './group-member.service';
import { ApiProperty } from '@nestjs/swagger';

class CreateGroupMemberDto {
  @ApiProperty() groupId: string;
  @ApiProperty({ required: false }) userId?: string;
  @ApiProperty() email: string;
  @ApiProperty({ required: false }) fullName?: string;
  @ApiProperty({ required: false }) status?: string;
  @ApiProperty({ required: false }) isRegistered?: boolean;
  @ApiProperty({ required: false }) invitedAt?: Date;
  @ApiProperty({ required: false }) acceptedAt?: Date;
}

class UpdateGroupMemberDto {
  @ApiProperty({ required: false }) userId?: string;
  @ApiProperty({ required: false }) email?: string;
  @ApiProperty({ required: false }) fullName?: string;
  @ApiProperty({ required: false }) status?: string;
  @ApiProperty({ required: false }) isRegistered?: boolean;
  @ApiProperty({ required: false }) invitedAt?: Date;
  @ApiProperty({ required: false }) acceptedAt?: Date;
}

@Controller('group-member')
export class GroupMemberController {
  constructor(private readonly groupMemberService: GroupMemberService) {}

  @Post()
  async create(@Body() dto: CreateGroupMemberDto) {
    return this.groupMemberService.create(dto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.groupMemberService.getById(id);
  }

  @Get()
  async list() {
    return this.groupMemberService.list();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateGroupMemberDto) {
    return this.groupMemberService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.groupMemberService.delete(id);
  }
}
