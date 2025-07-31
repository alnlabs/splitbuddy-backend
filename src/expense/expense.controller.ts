import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import {
  ApiProperty,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

class CreateExpenseDto {
  @ApiProperty({ description: 'Group ID for the expense' }) groupId: string;
  @ApiProperty({ description: 'Expense amount' }) amount: number;
  @ApiProperty({ description: 'Category ID for the expense' })
  categoryId: string;
  @ApiProperty({ description: 'Payment method ID' }) paymentMethodId: string;
  @ApiProperty({ required: false, description: 'Expense description' })
  description?: string;
  @ApiProperty({ description: 'Expense date' }) date: Date;
  @ApiProperty({ description: 'User ID who added the expense' })
  addedBy: string;
  @ApiProperty({ description: 'Author ID' }) authorId: string;
}

class UpdateExpenseDto {
  @ApiProperty({ required: false, description: 'Expense amount' })
  amount?: number;
  @ApiProperty({ required: false, description: 'Category ID' })
  categoryId?: string;
  @ApiProperty({ required: false, description: 'Payment method ID' })
  paymentMethodId?: string;
  @ApiProperty({ required: false, description: 'Expense description' })
  description?: string;
  @ApiProperty({ required: false, description: 'Expense date' }) date?: Date;
}

class SplitExpenseDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID (optional)' },
        email: { type: 'string', description: 'Email address (optional)' },
        fullName: { type: 'string', description: 'Full name (optional)' },
        amount: { type: 'number', description: 'Split amount' },
        shareType: { type: 'string', description: 'Share type (optional)' },
        percentage: { type: 'number', description: 'Percentage (optional)' },
        notes: { type: 'string', description: 'Notes (optional)' },
      },
    },
    description: 'Array of expense splits',
  })
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

@ApiTags('Expenses')
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateExpenseDto) {
    return this.expenseService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple expenses in bulk' })
  @ApiResponse({ status: 201, description: 'Expenses created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkCreate(
    @Body() body: { expenses: CreateExpenseDto[] },
  ) {
    return this.expenseService.bulkCreate(body.expenses);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getById(@Param('id') id: string) {
    return this.expenseService.getById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'List expenses with optional filters' })
  @ApiQuery({ name: 'groupId', required: false, description: 'Filter by group ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiResponse({ status: 200, description: 'Expenses retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(
    @Query('groupId') groupId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.expenseService.list(groupId, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('category/:categoryId')
  @ApiOperation({ summary: 'List expenses by category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Expenses retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listByCategory(@Param('categoryId') categoryId: string) {
    return this.expenseService.listByCategory(categoryId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('date-range')
  @ApiOperation({ summary: 'List expenses by date range' })
  @ApiQuery({ name: 'start', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end', description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Expenses retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listByDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.expenseService.listByDateRange(start, end);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('unsettled')
  @ApiOperation({ summary: 'List unsettled expenses' })
  @ApiQuery({ name: 'groupId', required: false, description: 'Filter by group ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiResponse({ status: 200, description: 'Unsettled expenses retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listUnsettled(
    @Query('groupId') groupId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.expenseService.listUnsettled(groupId, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('group/:groupId/balances')
  @ApiOperation({ summary: 'Get group balances' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group balances retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async groupBalances(@Param('groupId') groupId: string) {
    return this.expenseService.groupBalances(groupId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('user/:userId/balances')
  @ApiOperation({ summary: 'Get user balances' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User balances retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async userBalances(@Param('userId') userId: string) {
    return this.expenseService.userBalances(userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({ summary: 'Update expense by ID' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expenseService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple expenses in bulk' })
  @ApiResponse({ status: 200, description: 'Expenses updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkUpdate(
    @Body() body: { updates: { id: string; data: UpdateExpenseDto }[] },
  ) {
    return this.expenseService.bulkUpdate(body.updates);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense by ID' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string) {
    return this.expenseService.delete(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple expenses in bulk' })
  @ApiResponse({ status: 200, description: 'Expenses deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkDelete(@Body() body: { ids: string[] }) {
    return this.expenseService.bulkDelete(body.ids);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post(':expenseId/split')
  @ApiOperation({ summary: 'Split an expense among multiple users' })
  @ApiParam({ name: 'expenseId', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense split successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async splitExpense(
    @Param('expenseId') expenseId: string,
    @Body() dto: SplitExpenseDto,
  ) {
    return this.expenseService.splitExpense(expenseId, dto.splits);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':expenseId/splits')
  @ApiOperation({ summary: 'Get expense splits' })
  @ApiParam({ name: 'expenseId', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense splits retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getExpenseSplits(@Param('expenseId') expenseId: string) {
    return this.expenseService.getExpenseSplits(expenseId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('splits/:splitId/settle')
  @ApiOperation({ summary: 'Settle an expense split' })
  @ApiParam({ name: 'splitId', description: 'Split ID' })
  @ApiResponse({ status: 200, description: 'Split settled successfully' })
  @ApiResponse({ status: 404, description: 'Split not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async settleSplit(@Param('splitId') splitId: string) {
    return this.expenseService.settleSplit(splitId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('splits/user')
  @ApiOperation({ summary: 'Get user splits' })
  @ApiQuery({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User splits retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserSplits(@Query('userId') userId: string) {
    return this.expenseService.getUserSplits(userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('remind-unsettled')
  @ApiOperation({ summary: 'Send reminders for unsettled expenses' })
  @ApiResponse({ status: 200, description: 'Reminders sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remindUnsettled() {
    return this.expenseService.remindUnsettled();
  }
}
