import { Injectable, NotFoundException, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../entities/Users';
import { CreateAdminDto, LoginAdminDto, UpdateAdminDto } from '../../dto/admin.dto';
import * as bcrypt from 'bcrypt';
import { RolesService } from '../roles/roles.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private rolesService: RolesService,
    private jwtService: JwtService,
  ) {}

  // Khởi tạo tài khoản admin mặc định khi ứng dụng khởi động
  async onModuleInit() {
    // Kiểm tra xem đã có admin nào trong hệ thống chưa
    const adminRole = await this.rolesService.findByName('admin');
    if (!adminRole) {
      // Tạo role admin nếu chưa có
      await this.rolesService.create('admin', 'Administrator role');
    }

    // Tìm kiếm admin trong hệ thống
    const admins = await this.findAllAdmins();
    if (admins.length === 0) {
      // Tạo tài khoản admin mặc định nếu chưa có
      console.log('Creating default admin account...');
      await this.createAdmin({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123', // Nên đổi mật khẩu sau khi đăng nhập
        role: 'admin',
      });
      console.log('Default admin created with email: admin@example.com and password: admin123');
    }
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Users> {
    const { email, password, ...rest } = createAdminDto;

    // Kiểm tra email đã tồn tại
    const existingAdmin = await this.usersRepository.findOne({ where: { email } });
    if (existingAdmin) {
      throw new UnauthorizedException('Email đã được sử dụng');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lấy role admin
    let adminRole = await this.rolesService.findByName('admin');
    if (!adminRole) {
      adminRole = await this.rolesService.create('admin', 'Administrator role');
    }

    // Tạo admin mới
    const admin = this.usersRepository.create({
      ...rest,
      email,
      password: hashedPassword,
      roles: [adminRole],
    });

    return this.usersRepository.save(admin);
  }

  async loginAdmin(loginAdminDto: LoginAdminDto): Promise<{ admin: Users; token: string }> {
    const { email, password } = loginAdminDto;

    // Tìm admin theo email
    const admin = await this.usersRepository.findOne({ 
      where: { email },
      relations: ['roles'],
    });
    if (!admin) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra role
    const isAdmin = admin.roles.some(role => role.name === 'admin');
    if (!isAdmin) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    // Tạo JWT token
    const payload = { sub: admin.id, email: admin.email, roles: admin.roles.map(r => r.name) };
    const token = this.jwtService.sign(payload);

    // Loại bỏ password trước khi trả về
    const { password: _, ...adminWithoutPassword } = admin;

    return { 
      admin: adminWithoutPassword as Users, 
      token 
    };
  }

  async updateAdmin(id: number, updateAdminDto: UpdateAdminDto): Promise<Users> {
    const admin = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['roles'],
    });
    if (!admin) {
      throw new NotFoundException('Không tìm thấy admin');
    }

    // Cập nhật thông tin
    Object.assign(admin, updateAdminDto);
    return this.usersRepository.save(admin);
  }

  async deleteAdmin(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Không tìm thấy admin');
    }
  }

  async findAllAdmins(): Promise<Users[]> {
    const adminRole = await this.rolesService.findByName('admin');
    if (!adminRole) {
      return [];
    }

    return this.usersRepository.find({
      relations: ['roles'],
      where: {
        roles: {
          id: adminRole.id,
        },
      },
    });
  }

  async findAdminById(id: number): Promise<Users> {
    const admin = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['roles'],
    });
    if (!admin) {
      throw new NotFoundException('Không tìm thấy admin');
    }
    return admin;
  }
} 