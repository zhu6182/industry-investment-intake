import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Intake } from '../../entities/intake.entity';
import { Review } from '../../entities/review.entity';
import { Report } from '../../entities/report.entity';
import { FollowUp } from '../../entities/follow-up.entity';
import { Visit } from '../../entities/visit.entity';
import { IntakeService } from '../intakes/intake.service';
import type { CurrentUser } from '../intakes/intake.service';
import { FollowUpsService } from '../follow-ups/follow-ups.service';
import { VisitsService } from '../visits/visits.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Intake)
    private readonly intakeRepo: Repository<Intake>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    private readonly intakeService: IntakeService,
    private readonly followUpsService: FollowUpsService,
    private readonly visitsService: VisitsService,
  ) {}

  async getTimeline(intakeId: number, currentUser: CurrentUser) {
    const intake = await this.intakeService.findOne(intakeId, currentUser);

    const reviews = await this.reviewRepo.find({
      where: { intakeId },
      relations: { reviewer: true },
      order: { createdAt: 'ASC' },
    });

    const reports = await this.reportRepo.find({
      where: { intakeId },
      order: { createdAt: 'ASC' },
    });

    let followUps: FollowUp[] = [];
    let visits: Visit[] = [];
    try {
      followUps = await this.followUpsService.findByIntake(intakeId, currentUser);
    } catch {
      followUps = [];
    }
    try {
      visits = await this.visitsService.findByIntake(intakeId, currentUser);
    } catch {
      visits = [];
    }

    const events: any[] = [];

    events.push({
      type: 'intake_created',
      time: intake.createdAt,
      title: '进件创建',
      description: `企业 ${intake.companyName} 提交进件申请`,
      actor: intake.applicant?.name || '-',
      data: null,
    });

    if (intake.tycValidation) {
      events.push({
        type: 'tyc_verified',
        time: intake.createdAt,
        title: intake.tycValidation.isValid ? '天眼查核名通过' : '天眼查核名未通过',
        description: intake.tycValidation.reasons?.join('；') || '',
        actor: '系统',
        data: intake.tycValidation,
      });
    }

    for (const review of reviews) {
      events.push({
        type: 'review',
        time: review.createdAt,
        title: review.action === 'approve' ? '审核通过' : '审核驳回',
        description: review.reason || '',
        actor: review.reviewer?.name || '-',
        data: review,
      });
    }

    for (const report of reports) {
      events.push({
        type: 'report_generated',
        time: report.createdAt,
        title: '报告生成',
        description: report.summary?.title || '制式报告已生成',
        actor: '系统',
        data: report,
      });
    }

    for (const fu of followUps) {
      const methodMap: Record<string, string> = {
        phone: '电话',
        wechat: '微信',
        email: '邮件',
        onsite: '上门',
        other: '其他',
      };
      events.push({
        type: 'follow_up',
        time: fu.followDate,
        title: `${methodMap[fu.method] || fu.method}跟进`,
        description: fu.content,
        actor: fu.operator?.name || '-',
        data: fu,
      });
    }

    for (const v of visits) {
      events.push({
        type: 'visit',
        time: v.visitDate,
        title: `拜访 - ${v.visitLocation}`,
        description: v.visitContent,
        actor: v.operator?.name || '-',
        data: v,
      });
    }

    events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return events;
  }

  async getDashboardStats(currentUser: CurrentUser) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const roles = currentUser.roles as Array<{ code: string; dataScope: string }> | undefined;
    const isAdminOrOps = roles?.some((r) => r.code === 'admin' || r.code === 'middleware_ops');

    let pendingQB = this.intakeRepo.createQueryBuilder('i');
    let myQB = this.intakeRepo.createQueryBuilder('i');

    if (!isAdminOrOps) {
      pendingQB.where('i.assignedToId = :userId', { userId: currentUser.id });
      myQB.where('i.assignedToId = :userId', { userId: currentUser.id });
    }

    pendingQB.andWhere('i.status IN (:...statuses)', {
      statuses: ['assigned', 'following'],
    });
    myQB.andWhere('i.status NOT IN (:...statuses)', {
      statuses: ['landed', 'lost'],
    });

    const [pendingCount, myActiveCount] = await Promise.all([
      pendingQB.getCount(),
      myQB.getCount(),
    ]);

    const [followUpThisMonth, visitThisMonth] = await Promise.all([
      this.followUpsService.countMyThisMonth(currentUser),
      this.visitsService.countMyThisMonth(currentUser),
    ]);

    return {
      pendingCount,
      myActiveCount,
      followUpThisMonth,
      visitThisMonth,
    };
  }

  async getTeamStats(currentUser: CurrentUser) {
    const roles = currentUser.roles as Array<{ code: string; dataScope: string }> | undefined;
    const isManager = roles?.some(
      (r) => r.code === 'investment_manager' || r.code === 'admin' || r.code === 'middleware_ops',
    );

    if (!isManager) {
      return { members: [], totalFollowUps: 0, totalVisits: 0 };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const assignedQB = this.intakeRepo.createQueryBuilder('i');
    assignedQB.where('i.assignedToId IS NOT NULL');
    const [assignedIntakes, totalIntakes] = await assignedQB.getManyAndCount();

    return {
      totalIntakes,
      startOfMonth,
      isManager: true,
      memberSummary: assignedIntakes.map((i) => ({
        intakeId: i.id,
        companyName: i.companyName,
        status: i.status,
        area: i.area,
        assignedToId: (i as any).assignedTo?.id,
      })),
    };
  }
}
