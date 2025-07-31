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

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  async getAllPlans(@Req() req: Request) {
    console.log('getAllPlans called');
    console.log('req.user:', req.user);
    console.log('req.headers:', req.headers);
    const userId =
      (req.user && (req.user as any).userId) ||
      req.headers['x-user-id'] ||
      'test-user-id';
    console.log('Extracted userId:', userId);
    return this.plansService.getAllPlansForUser(userId);
  }

  @Post()
  async createPlan(@Body() body: any, @Req() req: Request) {
    const userId =
      (req.user && (req.user as any).userId) ||
      req.headers['x-user-id'] ||
      'test-user-id';
    return this.plansService.createPlan(body, userId);
  }

  @Get(':id')
  async getPlanById(@Param('id') id: string) {
    return this.plansService.getPlanById(id);
  }

  @Put(':id')
  async updatePlan(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const userId =
      (req.user && (req.user as any).userId) ||
      req.headers['x-user-id'] ||
      'test-user-id';
    return this.plansService.updatePlan(id, body, userId);
  }

  @Delete(':id')
  async deletePlan(@Param('id') id: string) {
    return this.plansService.deletePlan(id);
  }
}
