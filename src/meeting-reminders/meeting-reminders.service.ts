import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingReminder } from './entities/meeting-reminder.entity';
import { ReminderProducer } from './reminder.producer';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { User } from '../users/entities/user.entity';

export type ReminderView = 'upcoming' | 'past' | 'current';

@Injectable()
export class MeetingRemindersService {
  constructor(
    @InjectRepository(MeetingReminder)
    private reminderRepo: Repository<MeetingReminder>,
    private producer: ReminderProducer,
  ) {}

  async create(
    userId: string,
    dto: CreateReminderDto,
  ): Promise<MeetingReminder> {
    const remindAt = new Date(dto.remindAt);
    if (remindAt <= new Date()) {
      throw new BadRequestException('remindAt must be in the future');
    }

    // Use a partial entity reference so TypeORM sets the FK without an extra lookup.
    // findOne after save lets eager loading resolve createdBy for the response.
    const entity = this.reminderRepo.create({
      title: dto.title,
      content: dto.content,
      remindAt,
      createdBy: { id: userId } as User,
    });

    const saved = await this.reminderRepo.save(entity);
    await this.producer.enqueue(saved.id, saved.remindAt);

    return (await this.reminderRepo.findOne({ where: { id: saved.id } }))!;
  }

  async findAll(view?: ReminderView): Promise<MeetingReminder[]> {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const qb = this.reminderRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.createdBy', 'user')
      .orderBy('r.remindAt', 'ASC');

    if (view === 'upcoming') {
      qb.where('r.remindAt > :now', { now });
    } else if (view === 'past') {
      qb.where('r.remindAt < :now', { now });
    } else if (view === 'current') {
      qb.where('r.isSent = :sent AND r.remindAt >= :ago', {
        sent: true,
        ago: fiveMinutesAgo,
      });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<MeetingReminder> {
    const reminder = await this.reminderRepo.findOne({ where: { id } });
    if (!reminder) throw new NotFoundException('Reminder not found');
    return reminder;
  }

  async update(id: string, dto: UpdateReminderDto): Promise<MeetingReminder> {
    const reminder = await this.findOne(id);
    const now = new Date();

    if (reminder.remindAt <= now || reminder.isSent) {
      throw new BadRequestException(
        'Cannot edit a reminder after its scheduled time or once sent',
      );
    }

    if (dto.remindAt !== undefined) {
      const newRemindAt = new Date(dto.remindAt);
      if (newRemindAt <= now) {
        throw new BadRequestException('remindAt must be in the future');
      }
      reminder.remindAt = newRemindAt;
      await this.producer.reschedule(id, newRemindAt);
    }

    if (dto.title !== undefined) reminder.title = dto.title;
    if (dto.content !== undefined) reminder.content = dto.content;

    return this.reminderRepo.save(reminder);
  }

  async remove(id: string): Promise<void> {
    const reminder = await this.findOne(id);

    if (reminder.isSent || reminder.remindAt <= new Date()) {
      throw new BadRequestException(
        'Cannot delete a reminder after its scheduled time or once sent',
      );
    }

    await this.producer.remove(id);
    await this.reminderRepo.delete(id);
  }
}
