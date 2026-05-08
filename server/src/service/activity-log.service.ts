import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../domain/activity-log.entity';
import { ActivityAction } from '../domain/enumeration/activity-action';
import { ActivityLogDTO } from '../service/dto/activity-log.dto';
import { ActivityLogMapper } from '../service/mapper/activity-log.mapper';

@Injectable()
export class ActivityLogService {
  logger = new Logger('ActivityLogService');

  constructor(@InjectRepository(ActivityLog) private activityLogRepository: Repository<ActivityLog>) {}

  async findAll(limit = 20): Promise<ActivityLogDTO[]> {
    const results = await this.activityLogRepository.find({
      order: { createdAt: 'DESC' } as any,
      take: limit,
    });
    return results.map(a => ActivityLogMapper.fromEntityToDTO(a));
  }

  async logActivity(
    action: ActivityAction,
    description: string,
    opts?: { reference?: string; amount?: number; personName?: string },
  ): Promise<void> {
    const entry = new ActivityLog();
    entry.action = action;
    entry.description = description;
    entry.createdAt = new Date();
    if (opts) {
      if (opts.reference !== undefined) entry.reference = opts.reference;
      if (opts.amount !== undefined) entry.amount = opts.amount;
      if (opts.personName !== undefined) entry.personName = opts.personName;
    }
    await this.activityLogRepository.save(entry);
  }
}
