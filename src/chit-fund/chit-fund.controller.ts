import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ChitFundService } from './chit-fund.service';
import { CreateChitFundDto, UpdateChitFundDto } from './chit-fund.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Chit Funds')
@Controller('chit-funds')
export class ChitFundController {
  constructor(private readonly chitFundService: ChitFundService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Create a new chit fund' })
  @ApiResponse({ status: 201, description: 'Chit fund created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateChitFundDto) {
    return this.chitFundService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Get all chit funds' })
  @ApiResponse({ status: 200, description: 'Chit funds retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.chitFundService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get chit fund by ID' })
  @ApiParam({ name: 'id', description: 'Chit fund ID' })
  @ApiResponse({ status: 200, description: 'Chit fund retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Chit fund not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.chitFundService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  @ApiOperation({ summary: 'Update chit fund by ID' })
  @ApiParam({ name: 'id', description: 'Chit fund ID' })
  @ApiResponse({ status: 200, description: 'Chit fund updated successfully' })
  @ApiResponse({ status: 404, description: 'Chit fund not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() dto: UpdateChitFundDto) {
    return this.chitFundService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete chit fund by ID' })
  @ApiParam({ name: 'id', description: 'Chit fund ID' })
  @ApiResponse({ status: 200, description: 'Chit fund deleted successfully' })
  @ApiResponse({ status: 404, description: 'Chit fund not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.chitFundService.remove(id);
  }
}
