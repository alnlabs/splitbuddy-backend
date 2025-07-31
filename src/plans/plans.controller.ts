import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiProperty,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

interface UserRequest extends Request {
  user: {
    userId: string;
    username: string;
  };
}

class CreatePlanDto {
  @ApiProperty({ description: 'Plan name' }) name: string;
  @ApiProperty({ description: 'Plan description' }) description: string;
  @ApiProperty({ description: 'Plan amount' }) amount: number;
  @ApiProperty({ description: 'Plan duration in months' }) duration: number;
  @ApiProperty({ required: false, description: 'Plan category' }) category?: string;
  @ApiProperty({ required: false, description: 'Plan status' }) status?: string;
}

class UpdatePlanDto {
  @ApiProperty({ required: false, description: 'Plan name' }) name?: string;
  @ApiProperty({ required: false, description: 'Plan description' }) description?: string;
  @ApiProperty({ required: false, description: 'Plan amount' }) amount?: number;
  @ApiProperty({ required: false, description: 'Plan duration in months' }) duration?: number;
  @ApiProperty({ required: false, description: 'Plan category' }) category?: string;
  @ApiProperty({ required: false, description: 'Plan status' }) status?: string;
}

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Get all plans for user' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllPlans(@Req() req: UserRequest) {
    return this.plansService.getAllPlansForUser(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPlan(@Body() body: CreatePlanDto, @Req() req: UserRequest) {
    return this.plansService.createPlan(body, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPlanById(@Param('id') id: string) {
    return this.plansService.getPlanById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  @ApiOperation({ summary: 'Update plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePlan(
    @Param('id') id: string,
    @Body() body: UpdatePlanDto,
    @Req() req: UserRequest,
  ) {
    return this.plansService.updatePlan(id, body, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deletePlan(@Param('id') id: string) {
    return this.plansService.deletePlan(id);
  }
}
