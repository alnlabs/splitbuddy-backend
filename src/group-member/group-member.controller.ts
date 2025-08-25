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
import {
  CreateGroupMemberDto,
  UpdateGroupMemberDto,
  GroupMemberResponseDto,
} from './group-member.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Group Members')
@Controller('group-member')
export class GroupMemberController {
  constructor(private readonly groupMemberService: GroupMemberService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group member' })
  @ApiResponse({
    status: 201,
    description: 'Group member created successfully',
    type: GroupMemberResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() dto: CreateGroupMemberDto,
  ): Promise<GroupMemberResponseDto> {
    return this.groupMemberService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group member by ID' })
  @ApiParam({ name: 'id', description: 'Group member ID' })
  @ApiResponse({
    status: 200,
    description: 'Group member found',
    type: GroupMemberResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Group member not found' })
  async getById(
    @Param('id') id: string,
  ): Promise<GroupMemberResponseDto | null> {
    return this.groupMemberService.getById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all group members' })
  @ApiResponse({
    status: 200,
    description: 'List of group members',
    type: [GroupMemberResponseDto],
  })
  async list(): Promise<GroupMemberResponseDto[]> {
    return this.groupMemberService.list();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a group member' })
  @ApiParam({ name: 'id', description: 'Group member ID' })
  @ApiResponse({
    status: 200,
    description: 'Group member updated successfully',
    type: GroupMemberResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Group member not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGroupMemberDto,
  ): Promise<GroupMemberResponseDto | null> {
    return this.groupMemberService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group member' })
  @ApiParam({ name: 'id', description: 'Group member ID' })
  @ApiResponse({
    status: 200,
    description: 'Group member deleted successfully',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'boolean', example: true },
      },
    },
  })
  async delete(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.groupMemberService.delete(id);
  }
}
