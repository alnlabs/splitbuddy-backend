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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  SplitExpenseDto,
  BulkCreateExpenseDto,
  CreateExpenseResponseDto,
  GetExpenseResponseDto,
  UpdateExpenseResponseDto,
  ListExpensesResponseDto,
  ListExpenseSplitsResponseDto,
  UserBalancesResponseDto,
  GroupBalancesResponseDto,
  BulkCreateExpenseResponseDto,
  BulkUpdateExpenseResponseDto,
  BulkDeleteExpenseResponseDto,
  DeleteExpenseResponseDto,
  SettleSplitResponseDto,
  RemindUnsettledResponseDto,
} from './expense.dto';
import { ApiError } from '../common/dto/base-response.dto';

@ApiTags('Expenses')
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({
    summary: 'Create a new expense',
    description:
      'Creates a new expense in a group with specified category and payment method',
  })
  @ApiBody({ type: CreateExpenseDto })
  @ApiResponse({
    status: 201,
    description: 'Expense created successfully',
    type: CreateExpenseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    type: ApiError,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async create(@Body() dto: CreateExpenseDto) {
    return this.expenseService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('bulk')
  @ApiOperation({
    summary: 'Create multiple expenses',
    description:
      'Creates multiple expenses in a single request for batch processing',
  })
  @ApiBody({ type: BulkCreateExpenseDto })
  @ApiResponse({
    status: 201,
    description: 'Expenses created successfully',
    type: BulkCreateExpenseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    type: ApiError,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async bulkCreate(@Body() body: BulkCreateExpenseDto) {
    return this.expenseService.bulkCreate(body.expenses);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({
    summary: 'Get expense by ID',
    description: 'Retrieves detailed information about a specific expense',
  })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({
    status: 200,
    description: 'Expense retrieved successfully',
    type: GetExpenseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
    type: ApiError,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async getById(@Param('id') id: string) {
    return this.expenseService.getById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({
    summary: 'List expenses with optional filters',
    description:
      'Retrieves a paginated list of expenses with optional filtering by group and user',
  })
  @ApiQuery({
    name: 'groupId',
    required: false,
    description: 'Filter by group ID',
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (1-100)',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Expenses retrieved successfully',
    type: ListExpensesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async list(
    @Query('groupId') groupId?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.expenseService.list(groupId, userId, page, limit);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('by-category/:categoryId')
  @ApiOperation({
    summary: 'List expenses by category',
    description: 'Retrieves all expenses for a specific category',
  })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Expenses retrieved successfully',
    type: ListExpensesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async listByCategory(@Param('categoryId') categoryId: string) {
    return this.expenseService.listByCategory(categoryId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('by-date')
  @ApiOperation({
    summary: 'List expenses by date range',
    description: 'Retrieves expenses within a specified date range',
  })
  @ApiQuery({
    name: 'start',
    description: 'Start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'end',
    description: 'End date (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Expenses retrieved successfully',
    type: ListExpensesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async listByDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.expenseService.listByDateRange(start, end);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('unsettled')
  @ApiOperation({
    summary: 'List unsettled expenses',
    description: 'Retrieves expenses that have not been settled yet',
  })
  @ApiQuery({
    name: 'groupId',
    required: false,
    description: 'Filter by group ID',
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Unsettled expenses retrieved successfully',
    type: ListExpensesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async listUnsettled(
    @Query('groupId') groupId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.expenseService.listUnsettled(groupId, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('balances/group/:groupId')
  @ApiOperation({
    summary: 'Get group balance summary',
    description: 'Retrieves balance summary for all members in a group',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Group balances retrieved successfully',
    type: GroupBalancesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async groupBalances(@Param('groupId') groupId: string) {
    return this.expenseService.groupBalances(groupId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('balances/user/:userId')
  @ApiOperation({
    summary: 'Get user balance summary',
    description:
      'Retrieves balance summary for a specific user across all groups',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User balances retrieved successfully',
    type: UserBalancesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async userBalances(@Param('userId') userId: string) {
    return this.expenseService.userBalances(userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({
    summary: 'Update an expense',
    description: 'Updates an existing expense with new information',
  })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiBody({ type: UpdateExpenseDto })
  @ApiResponse({
    status: 200,
    description: 'Expense updated successfully',
    type: UpdateExpenseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
    type: ApiError,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expenseService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('bulk')
  @ApiOperation({
    summary: 'Update multiple expenses',
    description:
      'Updates multiple expenses in a single request for batch processing',
  })
  @ApiResponse({
    status: 200,
    description: 'Expenses updated successfully',
    type: BulkUpdateExpenseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    type: ApiError,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async bulkUpdate(
    @Body() body: { updates: { id: string; data: UpdateExpenseDto }[] },
  ) {
    return this.expenseService.bulkUpdate(body.updates);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an expense',
    description: 'Permanently deletes an expense and all its associated splits',
  })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({
    status: 200,
    description: 'Expense deleted successfully',
    type: DeleteExpenseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
    type: ApiError,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async delete(@Param('id') id: string) {
    return this.expenseService.delete(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('bulk')
  @ApiOperation({
    summary: 'Delete multiple expenses',
    description: 'Permanently deletes multiple expenses in a single request',
  })
  @ApiResponse({
    status: 200,
    description: 'Expenses deleted successfully',
    type: BulkDeleteExpenseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    type: ApiError,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async bulkDelete(@Body() body: { ids: string[] }) {
    return this.expenseService.bulkDelete(body.ids);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post(':expenseId/split')
  @ApiOperation({
    summary: 'Split an expense among users',
    description:
      'Splits an expense among multiple users with specified amounts or percentages',
  })
  @ApiParam({ name: 'expenseId', description: 'Expense ID to split' })
  @ApiBody({ type: SplitExpenseDto })
  @ApiResponse({
    status: 201,
    description: 'Expense split successfully',
    type: ListExpenseSplitsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
    type: ApiError,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async splitExpense(
    @Param('expenseId') expenseId: string,
    @Body() dto: SplitExpenseDto,
  ) {
    return this.expenseService.splitExpense(expenseId, dto.splits);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':expenseId/splits')
  @ApiOperation({
    summary: 'Get expense splits',
    description: 'Retrieves all splits for a specific expense',
  })
  @ApiParam({ name: 'expenseId', description: 'Expense ID' })
  @ApiResponse({
    status: 200,
    description: 'Expense splits retrieved successfully',
    type: ListExpenseSplitsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async getExpenseSplits(@Param('expenseId') expenseId: string) {
    return this.expenseService.getExpenseSplits(expenseId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('splits/:splitId/settle')
  @ApiOperation({
    summary: 'Settle an expense split',
    description:
      'Marks an expense split as settled, indicating the debt has been paid',
  })
  @ApiParam({ name: 'splitId', description: 'Split ID to settle' })
  @ApiResponse({
    status: 200,
    description: 'Split settled successfully',
    type: SettleSplitResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Split not found',
    type: ApiError,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async settleSplit(@Param('splitId') splitId: string) {
    return this.expenseService.settleSplit(splitId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('splits/user/:userId')
  @ApiOperation({
    summary: 'Get user expense splits',
    description: 'Retrieves all expense splits for a specific user',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User splits retrieved successfully',
    type: ListExpenseSplitsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async getUserSplits(@Param('userId') userId: string) {
    return this.expenseService.getUserSplits(userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('remind-unsettled')
  @ApiOperation({
    summary: 'Send reminders for unsettled expenses',
    description:
      'Sends email reminders to users with unsettled expense balances',
  })
  @ApiResponse({
    status: 200,
    description: 'Reminders sent successfully',
    type: RemindUnsettledResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ApiError,
  })
  async remindUnsettled() {
    return this.expenseService.remindUnsettled();
  }
}
