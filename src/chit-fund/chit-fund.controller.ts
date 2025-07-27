import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ChitFundService } from './chit-fund.service';
import { CreateChitFundDto, UpdateChitFundDto } from './chit-fund.dto';

@Controller('chit-funds')
export class ChitFundController {
  constructor(private readonly chitFundService: ChitFundService) {}

  @Post()
  create(@Body() dto: CreateChitFundDto) {
    return this.chitFundService.create(dto);
  }

  @Get()
  findAll() {
    return this.chitFundService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chitFundService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChitFundDto) {
    return this.chitFundService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chitFundService.remove(id);
  }
}
