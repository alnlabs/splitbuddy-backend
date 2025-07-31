import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GroupMemberService } from './group-member.service';
import {
  ApiProperty,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

class CreateGroupMemberDto {
  @ApiProperty({ description: 'Group ID' }) groupId: string;
  @ApiProperty({ required: false, description: 'User ID (if registered)' }) userId?: string;
  @ApiProperty({ description: 'Email address' }) email: string;
  @ApiProperty({ required: false, description: 'Full name' }) fullName?: string;
  @ApiProperty({ required: false, description: 'Member status' }) status?: string;
  @ApiProperty({ required: false, description: 'Is user registered' }) isRegistered?: boolean;
  @ApiProperty({ required: false, description: 'Invitation date' }) invitedAt?: Date;
  @ApiProperty({ required: false, description: 'Acceptance date' }) acceptedAt?: Date;
}

class UpdateGroupMemberDto {
  @ApiProperty({ required: false, description: 'User ID' }) userId?: string;
  @ApiProperty({ required: false, description: 'Email address' }) email?: string;
  @ApiProperty({ required: false, description: 'Full name' }) fullName?: string;
  @ApiProperty({ required: false, description: 'Member status' }) status?: string;
  @ApiProperty({ required: false, description: 'Is user registered' }) isRegistered?: boolean;
  @ApiProperty({ required: false, description: 'Invitation date' }) invitedAt?: Date;
  @ApiProperty({ required: false, description: 'Acceptance date' }) acceptedAt?: Date;
}

@ApiTags('Group Members')
@Controller('group-member')
export class GroupMemberController {
  constructor(private readonly groupMemberService: GroupMemberService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Create a new group member' })
  @ApiResponse({ status: 201, description: 'Group member created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateGroupMemberDto) {
    return this.groupMemberService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get group member by ID' })
  @ApiParam({ name: 'id', description: 'Group member ID' })
  @ApiResponse({ status: 200, description: 'Group member retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Group member not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getById(@Param('id') id: string) {
    return this.groupMemberService.getById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'List all group members' })
  @ApiResponse({ status: 200, description: 'Group members retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list() {
    return this.groupMemberService.list();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({ summary: 'Update group member by ID' })
  @ApiParam({ name: 'id', description: 'Group member ID' })
  @ApiResponse({ status: 200, description: 'Group member updated successfully' })
  @ApiResponse({ status: 404, description: 'Group member not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() dto: UpdateGroupMemberDto) {
    return this.groupMemberService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete group member by ID' })
  @ApiParam({ name: 'id', description: 'Group member ID' })
  @ApiResponse({ status: 200, description: 'Group member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Group member not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string) {
    return this.groupMemberService.delete(id);
  }
}
