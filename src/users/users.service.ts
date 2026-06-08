import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

export interface UserListItem {
  id: string;
  name: string;
  discordId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  discordId: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserProfile> {
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
    return this.toProfile(saved);
  }

  async findAll(): Promise<UserListItem[]> {
    const users = await this.userRepo.find({
      select: { id: true, name: true, discordId: true },
    });
    return users.map(({ id, name, discordId }) => ({ id, name, discordId }));
  }

  async findMe(userId: string): Promise<UserProfile> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.toProfile(user);
  }

  // Used by MeetingRemindersModule — returns the full entity for internal use
  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private toProfile(user: User): UserProfile {
    const { id, email, discordId, name, role, createdAt } = user;
    return { id, email, discordId, name, role, createdAt };
  }
}
