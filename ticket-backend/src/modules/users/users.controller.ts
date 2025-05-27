import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('buyers-of-my-events')
  async getBuyersOfMyEvents(@Request() req) {
    const userId = req.user.userId;
    return this.usersService.getBuyersOfMyEvents(userId);
  }
} 