import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUp } from '../../entities/follow-up.entity';
import { IntakeService } from '../intakes/intake.service';
import type { CurrentUser } from '../intakes/intake.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { QueryFollowUpDto } from './dto/query-follow-up.dto';

@Injectable()
export class FollowUpsService {
  constructor(
    @InjectRepository(FollowUp)
    private readonly followUpRepo: Repository<FollowUp>,
    private readonly intakeService: IntakeService,
  ) {}

  private isAdminOrManager(user: CurrentUser): boolean {
    const codes = (user.roles as Array<{ code: string }>)?.map((r) => r.code) || [];
    return codes.includes('admin') || codes.includes('middleware_ops');
  }

  private hasTeamAccess(user: CurrentUser): boolean {
    const roles = user.roles as Array<{ code: string; dataScope: string }> | undefined;
    return !!roles?.some((r) => r.code === 'investment_manager' || r.dataScope === 'team' || r.dataScope === 'region' || r.dataScope === 'all');
  }

  async create(dto: CreateFollowUpDto, operator: CurrentUser): Promise<FollowUp> {
    await this.intakeService.findOne(dto.intakeId, operator);

    const followUp = new FollowUp();
    followUp.intakeId = dto.intakeId;
    followUp.method = dto.method as any;
    followUp.content = dto.content;
    followUp.followDate = new Date(dto.followDate);
    followUp.photos = dto.photos || [];
    followUp.result = (dto.result || 'undecided') as any;
    followUp.nextStep = dto.nextStep as any;
    followUp.operator = { id: operator.id } as any;

    return this.followUpRepo.save(followUp);
  }

  async findAll(
    query: QueryFollowUpDto,
    currentUser: CurrentUser,
  ): Promise<[FollowUp[], number]> {
    const qb = this.followUpRepo.createQueryBuilder('f');
    qb.leftJoinAndSelect('f.operator', 'operator');

    if (query.intakeId) {
      await this.intakeService.findOne(query.intakeId, currentUser);
      qb.andWhere('f.intakeId = :intakeId', { intakeId: query.intakeId });
    }

    if (!this.isAdminOrManager(currentUser)) {
      qb.andWhere('f.operatorId = :userId', { userId: currentUser.id });
    }

    if (query.method) {
      qb.andWhere('f.method = :method', { method: query.method });
    }
    if (query.result) {
      qb.andWhere('f.result = :result', { result: query.result });
    }

    qb.orderBy('f.followDate', 'DESC');

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    qb.skip((page - 1) * pageSize).take(pageSize);

    return qb.getManyAndCount();
  }

  async findMy(
    query: QueryFollowUpDto,
    currentUser: CurrentUser,
  ): Promise<[FollowUp[], number]> {
    const qb = this.followUpRepo.createQueryBuilder('f');
    qb.leftJoinAndSelect('f.operator', 'operator');

    qb.andWhere('f.operatorId = :userId', { userId: currentUser.id });

    if (query.intakeId) {
      qb.andWhere('f.intakeId = :intakeId', { intakeId: query.intakeId });
    }
    if (query.method) {
      qb.andWhere('f.method = :method', { method: query.method });
    }
    if (query.result) {
      qb.andWhere('f.result = :result', { result: query.result });
    }

    qb.orderBy('f.followDate', 'DESC');

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    qb.skip((page - 1) * pageSize).take(pageSize);

    return qb.getManyAndCount();
  }

  async findOne(id: number, currentUser: CurrentUser): Promise<FollowUp> {
    const followUp = await this.followUpRepo.findOne({
      where: { id },
      relations: { operator: true },
    });

    if (!followUp) {
      throw new NotFoundException(`跟进记录 #${id} 不存在`);
    }

    if (!this.isAdminOrManager(currentUser) && followUp.operator?.id !== currentUser.id) {
      throw new ForbiddenException('无权访问此跟进记录');
    }

    return followUp;
  }

  async findByIntake(intakeId: number, currentUser: CurrentUser): Promise<FollowUp[]> {
    await this.intakeService.findOne(intakeId, currentUser);

    const qb = this.followUpRepo.createQueryBuilder('f');
    qb.leftJoinAndSelect('f.operator', 'operator');
    qb.where('f.intakeId = :intakeId', { intakeId });

    if (!this.isAdminOrManager(currentUser)) {
      qb.andWhere('f.operatorId = :userId', { userId: currentUser.id });
    }

    qb.orderBy('f.followDate', 'DESC');
    return qb.getMany();
  }

  async countMyThisMonth(currentUser: CurrentUser): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.followUpRepo
      .createQueryBuilder('f')
      .where('f.operatorId = :userId', { userId: currentUser.id })
      .andWhere('f.createdAt >= :start', { start: startOfMonth })
      .getCount();
  }
}
