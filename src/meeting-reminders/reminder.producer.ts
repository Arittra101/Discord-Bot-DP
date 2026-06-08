import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export const REMINDER_QUEUE = 'reminder';

@Injectable()
export class ReminderProducer {
  constructor(@InjectQueue(REMINDER_QUEUE) private queue: Queue) {}

  async enqueue(reminderId: string, remindAt: Date): Promise<void> {
    const delay = remindAt.getTime() - Date.now();
    await this.queue.add('fire', { reminderId }, { delay, jobId: reminderId });
  }

  async reschedule(reminderId: string, remindAt: Date): Promise<void> {
    const existing = await this.queue.getJob(reminderId);
    await existing?.remove();
    await this.enqueue(reminderId, remindAt);
  }

  async remove(reminderId: string): Promise<void> {
    const job = await this.queue.getJob(reminderId);
    await job?.remove();
  }
}
