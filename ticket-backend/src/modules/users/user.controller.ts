import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { UpdateUserDto } from '../../dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Get()
  index() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.getUserProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUserProfile(req.user.userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('buyers-of-my-events')
  getBuyersOfMyEvents(@Request() req) {
    return this.userService.getBuyersOfMyEvents(req.user.userId);
  }
}
