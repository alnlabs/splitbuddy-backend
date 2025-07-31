import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ApiProperty } from '@nestjs/swagger';

class CreateExpenseDto {
  @ApiProperty() groupId: string;
  @ApiProperty() amount: number;
  @ApiProperty() categoryId: string;
  @ApiProperty() paymentMethodId: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty() date: Date;
  @ApiProperty() addedBy: string;
  @ApiProperty() authorId: string;
}

class UpdateExpenseDto {
  @ApiProperty({ required: false }) amount?: number;
  @ApiProperty({ required: false }) categoryId?: string;
  @ApiProperty({ required: false }) paymentMethodId?: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ required: false }) date?: Date;
}

class SplitExpenseDto {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  splits: Array<{
    userId?: string;
    email?: string;
    fullName?: string;
    amount: number;
    shareType?: string;
    percentage?: number;
    notes?: string;
  }>;
}

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(@Body() dto: CreateExpenseDto) {
    return this.expenseService.create(dto);
  }

  @Post('bulk')
  async bulkCreate(@Body() body: { expenses: CreateExpenseDto[] }) {
    return this.expenseService.bulkCreate(body.expenses);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.expenseService.getById(id);
  }

  @Get()
  async list(
    @Query('groupId') groupId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.expenseService.list(groupId, userId);
  }

  @Get('by-category/:categoryId')
  async listByCategory(@Param('categoryId') categoryId: string) {
    return this.expenseService.listByCategory(categoryId);
  }

  @Get('by-date')
  async listByDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.expenseService.listByDateRange(start, end);
  }

  @Get('unsettled')
  async listUnsettled(
    @Query('groupId') groupId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.expenseService.listUnsettled(groupId, userId);
  }

  @Get('balances/group/:groupId')
  async groupBalances(@Param('groupId') groupId: string) {
    return this.expenseService.groupBalances(groupId);
  }

  @Get('balances/user/:userId')
  async userBalances(@Param('userId') userId: string) {
    return this.expenseService.userBalances(userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expenseService.update(id, dto);
  }

  @Patch('bulk')
  async bulkUpdate(
    @Body() body: { updates: { id: string; data: UpdateExpenseDto }[] },
  ) {
    return this.expenseService.bulkUpdate(body.updates);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.expenseService.delete(id);
  }

  @Delete('bulk')
  async bulkDelete(@Body() body: { ids: string[] }) {
    return this.expenseService.bulkDelete(body.ids);
  }

  @Post(':expenseId/split')
  async splitExpense(
    @Param('expenseId') expenseId: string,
    @Body() dto: SplitExpenseDto,
  ) {
    return this.expenseService.splitExpense(expenseId, dto.splits);
  }

  @Get(':expenseId/splits')
  async getExpenseSplits(@Param('expenseId') expenseId: string) {
    return this.expenseService.getExpenseSplits(expenseId);
  }

  @Patch('split/:splitId/settle')
  async settleSplit(@Param('splitId') splitId: string) {
    return this.expenseService.settleSplit(splitId);
  }

  @Get('splits')
  async getUserSplits(@Query('userId') userId: string) {
    return this.expenseService.getUserSplits(userId);
  }

  @Post('remind-unsettled')
  async remindUnsettled() {
    return this.expenseService.remindUnsettled();
  }
}
