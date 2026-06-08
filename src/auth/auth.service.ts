import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserProfile } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto): Promise<UserProfile> {
    const [emailTaken, discordTaken] = await Promise.all([
      this.userRepo.findOne({ where: { email: dto.email } }),
      this.userRepo.findOne({ where: { discordId: dto.discordId } }),
    ]);

    if (emailTaken) throw new ConflictException('Email already registered');
    if (discordTaken)
      throw new ConflictException('Discord ID already registered');

    const user = this.userRepo.create({
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, 10),
      discordId: dto.discordId,
      name: dto.name,
      role: dto.role,
    });

    const saved = await this.userRepo.save(user);
    const { id, email, discordId, name, role, createdAt } = saved;
    return { id, email, discordId, name, role, createdAt };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user || !(await bcrypt.compare(dto.oldPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must differ from current password',
      );
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);
  }
}
