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
import { GroupService } from './group.service';
import {
  ApiProperty,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

class CreateGroupDto {
  @ApiProperty({ description: 'Group name' }) groupName: string;
  @ApiProperty({ description: 'Currency code (e.g., USD, EUR)' }) currency: string;
  @ApiProperty({ description: 'Author ID' }) authorId: string;
  @ApiProperty({
    required: false,
    default: true,
    description:
      'Whether this group is shared (external people can join) or unshared (private group). Both types can have multiple members.',
  })
  isShared?: boolean;
}

class UpdateGroupDto {
  @ApiProperty({ required: false, description: 'Group name' }) groupName?: string;
  @ApiProperty({ required: false, description: 'Currency code' }) currency?: string;
  @ApiProperty({
    required: false,
    description:
      'Whether this group is shared (external people can join) or unshared (private group). Both types can have multiple members.',
  })
  isShared?: boolean;
}

@ApiTags('Groups')
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateGroupDto) {
    return this.groupService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getById(@Param('id') id: string) {
    return this.groupService.getById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'List all groups' })
  @ApiResponse({ status: 200, description: 'Groups retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list() {
    return this.groupService.list();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({ summary: 'Update group by ID' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group updated successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete group by ID' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group deleted successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string) {
    return this.groupService.delete(id);
  }
}
