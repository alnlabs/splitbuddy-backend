import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { Request as ExpressRequest } from 'express';

interface UserRequest extends ExpressRequest {
  user: {
    userId: string;
    username: string;
  };
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getUsers(@Query('fields') fields?: string) {
    const fieldsArray = fields ? fields.split(',') : undefined;
    return this.userService.getUsers(fieldsArray);
  }
}
