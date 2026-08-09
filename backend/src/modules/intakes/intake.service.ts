import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like, In } from 'typeorm';
import { Intake, IntakeStatus } from '../../entities/intake.entity';
import { IntakeFile } from '../../entities/intake-file.entity';
import { User } from '../../entities/user.entity';
import { Review } from '../../entities/review.entity';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { UpdateIntakeDto } from './dto/update-intake.dto';
import { QueryIntakeDto } from './dto/query-intake.dto';
import { TianyanchaService } from '../tianyancha/tianyancha.service';
import { ReportGeneratorService } from '../reports/report-generator.service';
import { ReferralsService } from '../referrals/referrals.service';

export interface CurrentUser {
  id: number;
  roles?: Array<{ code: string; dataScope: string }>;
  regionId?: number;
}

@Injectable()
export class IntakeService {
  constructor(
    @InjectRepository(Intake)
    private readonly intakeRepo: Repository<Intake>,
    @InjectRepository(IntakeFile)
    private readonly fileRepo: Repository<IntakeFile>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly tianyanchaService: TianyanchaService,
    private readonly reportService: ReportGeneratorService,
    private readonly referralsService: ReferralsService,
  ) {}

  private getUserDataScope(user: CurrentUser): string {
    if (!user.roles || user.roles.length === 0) return 'self';
    const roleDataScopes = user.roles.map((r) => r.dataScope);
    if (roleDataScopes.includes('all')) return 'all';
    if (roleDataScopes.includes('region')) return 'region';
    if (roleDataScopes.includes('team')) return 'team';
    return 'self';
  }

  private getUserRoleCodes(user: CurrentUser): string[] {
    return user.roles?.map((r) => r.code) || [];
  }

  private applyDataScopeFilter(
    qb: ReturnType<Repository<Intake>['createQueryBuilder']>,
    alias: string,
    user: CurrentUser,
  ): void {
    const scope = this.getUserDataScope(user);
    const roleCodes = this.getUserRoleCodes(user);

    if (roleCodes.includes('middleware_ops') || roleCodes.includes('admin')) {
      return;
    }

    switch (scope) {
      case 'all':
        return;

      case 'region':
        if (user.regionId) {
          qb.andWhere(`${alias}.applicationRegionId = :regionId`, {
            regionId: user.regionId,
          });
        }
        return;

      case 'team':
        qb.andWhere(
          `${alias}.applicantId IN (SELECT u.id FROM users u WHERE u.regionId = :regionId)`,
          { regionId: user.regionId || 0 },
        );
        return;

      case 'self':
      default:
        qb.andWhere(`${alias}.applicantId = :userId`, { userId: user.id });
        return;
    }
  }

  async checkExisting(companyName: string, excludeId?: number) {
    const qb = this.intakeRepo.createQueryBuilder('i');
    qb.leftJoinAndSelect('i.assignedTo', 'assignedTo');
    qb.leftJoinAndSelect('i.applicant', 'applicant');
    qb.where('i.companyName = :companyName', { companyName });
    if (excludeId) {
      qb.andWhere('i.id != :excludeId', { excludeId });
    }
    qb.orderBy('i.createdAt', 'DESC');
    const existing = await qb.getOne();
    if (!existing) {
      return { exists: false } as const;
    }
    return {
      exists: true,
      intakeId: existing.id,
      companyName: existing.companyName,
      status: existing.status,
      createdAt: existing.createdAt,
      applicantName: existing.applicant?.name,
      applicantPhone: existing.applicant?.phone,
      assignedToName: existing.assignedTo?.name,
      assignedToPhone: existing.assignedTo?.phone,
    } as const;
  }

  async create(dto: CreateIntakeDto, applicantUser: CurrentUser): Promise<Intake> {
    const exists = await this.checkExisting(dto.companyName);
    if (exists) {
      throw new BadRequestException(
        `企业 "${dto.companyName}" 已有在途跟进，请联系现有跟进人员`,
      );
    }

    const intake = this.intakeRepo.create({
      companyName: dto.companyName,
      creditCode: dto.creditCode,
      legalPerson: dto.legalPerson,
      establishDate: dto.establishDate,
      industry: dto.industry,
      shareholders: dto.shareholders,
      applicationRegionId: dto.applicationRegionId,
      area: dto.area,
      applicant: { id: applicantUser.id } as User,
      status: 'pending',
    });

    const validation = await this.tianyanchaService.validateAndEnrich(
      dto.companyName,
    );

    intake.tycValidation = {
      isValid: validation.isValid,
      reasons: validation.reasons,
      company: validation.company,
    };

    if (validation.company.creditCode && !dto.creditCode) {
      intake.creditCode = validation.company.creditCode;
    }
    if (validation.company.legalPerson && !dto.legalPerson) {
      intake.legalPerson = validation.company.legalPerson;
    }
    if (validation.company.establishDate && !dto.establishDate) {
      intake.establishDate = validation.company.establishDate;
    }
    if (validation.company.industry && !dto.industry) {
      intake.industry = validation.company.industry;
    }
    if (validation.company.shareholders && validation.company.shareholders.length > 0) {
      intake.shareholders = JSON.stringify(validation.company.shareholders);
    }

    const saved = await this.intakeRepo.save(intake);

    if (dto.referrerId) {
      try {
        await this.referralsService.createReferral(
          saved.id,
          dto.referrerId,
          dto.referralType || 'referrer',
        );
      } catch {
        // referral creation failure should not block intake creation
      }
    }

    return saved;
  }

  async findAll(
    query: QueryIntakeDto,
    currentUser: CurrentUser,
  ): Promise<[Intake[], number]> {
    const qb = this.intakeRepo.createQueryBuilder('i');
    qb.leftJoinAndSelect('i.applicant', 'applicant');
    qb.leftJoinAndSelect('i.assignedTo', 'assignedTo');

    this.applyDataScopeFilter(qb, 'i', currentUser);

    if (query.keyword) {
      qb.andWhere(
        '(i.companyName LIKE :kw OR i.creditCode LIKE :kw OR i.legalPerson LIKE :kw)',
        { kw: `%${query.keyword}%` },
      );
    }

    if (query.status) {
      qb.andWhere('i.status = :status', { status: query.status });
    }

    if (query.startDate) {
      qb.andWhere('i.createdAt >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('i.createdAt <= :endDate', { endDate: query.endDate });
    }

    qb.orderBy('i.createdAt', 'DESC');

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return [items, total];
  }

  async findOne(id: number, currentUser: CurrentUser): Promise<Intake> {
    const qb = this.intakeRepo.createQueryBuilder('i');
    qb.leftJoinAndSelect('i.applicant', 'applicant');
    qb.leftJoinAndSelect('i.assignedTo', 'assignedTo');
    qb.leftJoinAndSelect('i.files', 'files');
    qb.where('i.id = :id', { id });

    this.applyDataScopeFilter(qb, 'i', currentUser);

    const intake = await qb.getOne();
    if (!intake) {
      throw new NotFoundException(`进件记录 #${id} 不存在或无权限访问`);
    }
    return intake;
  }

  async update(
    id: number,
    dto: UpdateIntakeDto,
    currentUser: CurrentUser,
  ): Promise<Intake> {
    const intake = await this.findOne(id, currentUser);

    Object.assign(intake, dto);

    if (dto.companyName && dto.companyName !== intake.companyName) {
      const exists = await this.checkExisting(dto.companyName, id);
      if (exists) {
        throw new BadRequestException(
          `企业 "${dto.companyName}" 已有在途跟进`,
        );
      }
    }

    return this.intakeRepo.save(intake);
  }

  async submit(id: number, currentUser: CurrentUser): Promise<Intake> {
    const intake = await this.findOne(id, currentUser);

    if (intake.tycValidation?.isValid) {
      intake.status = 'approved';
    } else {
      intake.status = 'rejected';
      intake.rejectReason =
        intake.tycValidation?.reasons?.join('；') || '天眼查核名未通过';
    }

    return this.intakeRepo.save(intake);
  }

  async addFiles(
    intakeId: number,
    filesData: Array<{ type: string; url: string; originalName: string; storedName: string; size: number }>,
  ): Promise<IntakeFile[]> {
    const intake = await this.intakeRepo.findOne({ where: { id: intakeId } });
    if (!intake) {
      throw new NotFoundException(`进件记录 #${intakeId} 不存在`);
    }

    const savedFiles = filesData.map((f) =>
      this.fileRepo.create({
        type: f.type as any,
        url: f.url,
        originalName: f.originalName,
        storedName: f.storedName,
        size: f.size,
        intake: { id: intakeId },
      }),
    );

    return this.fileRepo.save(savedFiles);
  }

  async review(
    id: number,
    action: 'approve' | 'reject',
    reason: string | undefined,
    assignToUserId: number | undefined,
    reviewer: CurrentUser,
  ) {
    const intake = await this.intakeRepo.findOne({
      where: { id },
      relations: { applicant: true, assignedTo: true, files: true },
    });
    if (!intake) {
      throw new NotFoundException(`进件记录 #${id} 不存在`);
    }

    if (intake.status !== 'pending') {
      throw new BadRequestException(
        `该进件当前状态为 "${intake.status}"，仅 "待审核" 状态可执行审核`,
      );
    }

    let assignToUser: User | undefined;

    if (action === 'approve') {
      intake.status = assignToUserId ? 'assigned' : 'approved';
      intake.rejectReason = '';

      if (assignToUserId) {
        const found = await this.userRepo.findOne({ where: { id: assignToUserId } });
        if (!found) {
          throw new BadRequestException(`指定的招商人员 #${assignToUserId} 不存在`);
        }
        assignToUser = found;
        intake.assignedTo = found;
      }
    } else {
      intake.status = 'rejected';
      if (!reason || reason.trim().length === 0) {
        throw new BadRequestException('驳回操作必须填写原因');
      }
      intake.rejectReason = reason;
    }

    const savedIntake = await this.intakeRepo.save(intake);

    const review = this.reviewRepo.create({
      intakeId: id,
      action,
      reason,
      reviewer: { id: reviewer.id } as User,
      assignedToId: assignToUserId,
    });
    await this.reviewRepo.save(review);

    let reportGenerated = false;
    let reportUrl: string | null = null;
    if (action === 'approve') {
      try {
        const report = await this.reportService.generate(savedIntake, assignToUser);
        reportGenerated = true;
        reportUrl = report.pdfUrl;
      } catch (err) {
        reportGenerated = false;
      }
    }

    return {
      intake: savedIntake,
      review,
      reportGenerated,
      reportUrl,
    };
  }

  async getStatusHistory(id: number): Promise<any[]> {
    const reviews = await this.reviewRepo.find({
      where: { intakeId: id },
      order: { createdAt: 'DESC' },
    });
    return reviews;
  }

  async updateStatus(
    id: number,
    newStatus: IntakeStatus,
    operator: CurrentUser,
  ): Promise<Intake> {
    const intake = await this.findOne(id, operator);

    const allowedTransitions: Record<string, IntakeStatus[]> = {
      pending: ['rejected', 'approved'],
      approved: ['assigned'],
      assigned: ['following'],
      following: ['landed', 'lost'],
      landed: [],
      lost: [],
      rejected: [],
    };

    const allowed = allowedTransitions[intake.status] || [];
    if (allowed.length > 0 && !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `不允许从 "${intake.status}" 变更到 "${newStatus}"`,
      );
    }

    intake.status = newStatus;
    return this.intakeRepo.save(intake);
  }
}
