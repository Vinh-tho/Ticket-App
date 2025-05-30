import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Users } from '../../entities/Users';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    RolesModule,
    JwtModule.register({
      secret: '58c0cc0e0cb3319da1e95094873eec724907ccc54b337099aa7ef60ff7f2fe1f',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {} 