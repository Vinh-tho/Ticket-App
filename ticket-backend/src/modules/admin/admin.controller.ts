import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, LoginAdminDto, UpdateAdminDto } from '../../dto/admin.dto';
import { Users } from '../../entities/Users';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
  async register(@Body() createAdminDto: CreateAdminDto): Promise<Users> {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Post('login')
  async login(@Body() loginAdminDto: LoginAdminDto) {
    return this.adminService.loginAdmin(loginAdminDto);
  }

  @Get()
  async findAll(): Promise<Users[]> {
    return this.adminService.findAllAdmins();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Users> {
    return this.adminService.findAdminById(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<Users> {
    return this.adminService.updateAdmin(+id, updateAdminDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteAdmin(+id);
  }
} 