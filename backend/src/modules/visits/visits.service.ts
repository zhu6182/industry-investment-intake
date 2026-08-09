import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from '../../entities/visit.entity';
import { Intake } from '../../entities/intake.entity';
import { IntakeService } from '../intakes/intake.service';
import type { CurrentUser } from '../intakes/intake.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { QueryVisitDto } from './dto/query-visit.dto';

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    @InjectRepository(Intake)
    private readonly intakeRepo: Repository<Intake>,
    private readonly intakeService: IntakeService,
  ) {}

  private isAdminOrManager(user: CurrentUser): boolean {
    const codes = (user.roles as Array<{ code: string }>)?.map((r) => r.code) || [];
    return codes.includes('admin') || codes.includes('middleware_ops');
  }

  async create(dto: CreateVisitDto, operator: CurrentUser): Promise<Visit> {
    const intake = await this.intakeService.findOne(dto.intakeId, operator);

    const visit = new Visit();
    visit.intakeId = dto.intakeId;
    visit.visitDate = new Date(dto.visitDate);
    visit.visitLocation = dto.visitLocation;
    visit.visitContent = dto.visitContent;
    visit.photos = dto.photos || [];
    visit.applicationRegionId = dto.applicationRegionId as any;
    visit.area = dto.area as any;
    visit.operator = { id: operator.id } as any;

    const saved = await this.visitRepo.save(visit);

    if (dto.area && (!intake.area || dto.area > intake.area)) {
      await this.intakeRepo
        .createQueryBuilder()
        .update(Intake)
        .set({ area: dto.area, applicationRegionId: dto.applicationRegionId || intake.applicationRegionId })
        .where('id = :id', { id: intake.id })
        .execute();
    }

    return saved;
  }

  async findAll(
    query: QueryVisitDto,
    currentUser: CurrentUser,
  ): Promise<[Visit[], number]> {
    const qb = this.visitRepo.createQueryBuilder('v');
    qb.leftJoinAndSelect('v.operator', 'operator');
    qb.leftJoinAndSelect('v.region', 'region');

    if (query.intakeId) {
      await this.intakeService.findOne(query.intakeId, currentUser);
      qb.andWhere('v.intakeId = :intakeId', { intakeId: query.intakeId });
    }

    if (!this.isAdminOrManager(currentUser)) {
      qb.andWhere('v.operatorId = :userId', { userId: currentUser.id });
    }

    qb.orderBy('v.visitDate', 'DESC');

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    qb.skip((page - 1) * pageSize).take(pageSize);

    return qb.getManyAndCount();
  }

  async findMy(
    query: QueryVisitDto,
    currentUser: CurrentUser,
  ): Promise<[Visit[], number]> {
    const qb = this.visitRepo.createQueryBuilder('v');
    qb.leftJoinAndSelect('v.operator', 'operator');
    qb.leftJoinAndSelect('v.region', 'region');

    qb.andWhere('v.operatorId = :userId', { userId: currentUser.id });

    if (query.intakeId) {
      qb.andWhere('v.intakeId = :intakeId', { intakeId: query.intakeId });
    }

    qb.orderBy('v.visitDate', 'DESC');

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    qb.skip((page - 1) * pageSize).take(pageSize);

    return qb.getManyAndCount();
  }

  async findOne(id: number, currentUser: CurrentUser): Promise<Visit> {
    const visit = await this.visitRepo.findOne({
      where: { id },
      relations: { operator: true, region: true },
    });

    if (!visit) {
      throw new NotFoundException(`拜访记录 #${id} 不存在`);
    }

    if (!this.isAdminOrManager(currentUser) && visit.operator?.id !== currentUser.id) {
      throw new ForbiddenException('无权访问此拜访记录');
    }

    return visit;
  }

  async findByIntake(intakeId: number, currentUser: CurrentUser): Promise<Visit[]> {
    await this.intakeService.findOne(intakeId, currentUser);

    const qb = this.visitRepo.createQueryBuilder('v');
    qb.leftJoinAndSelect('v.operator', 'operator');
    qb.leftJoinAndSelect('v.region', 'region');
    qb.where('v.intakeId = :intakeId', { intakeId });

    if (!this.isAdminOrManager(currentUser)) {
      qb.andWhere('v.operatorId = :userId', { userId: currentUser.id });
    }

    qb.orderBy('v.visitDate', 'DESC');
    return qb.getMany();
  }

  async countMyThisMonth(currentUser: CurrentUser): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.visitRepo
      .createQueryBuilder('v')
      .where('v.operatorId = :userId', { userId: currentUser.id })
      .andWhere('v.createdAt >= :start', { start: startOfMonth })
      .getCount();
  }
}
