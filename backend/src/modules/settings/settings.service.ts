import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../entities/setting.entity';

const DEFAULT_REPORT_TEMPLATE = JSON.stringify({
  companyInfo: { visible: true, order: 1 },
  tycValidation: { visible: true, order: 2 },
  shareholding: { visible: true, order: 3 },
  financials: { visible: false, order: 4 },
  industryAnalysis: { visible: true, order: 5 },
  investmentRecommendation: { visible: true, order: 6 },
});

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingRepo: Repository<Setting>,
  ) {}

  async getByKey(key: string): Promise<string | null> {
    const setting = await this.settingRepo.findOne({ where: { key } });
    return setting?.value ?? null;
  }

  async set(key: string, value: string, description?: string): Promise<Setting> {
    let setting = await this.settingRepo.findOne({ where: { key } });
    if (!setting) {
      setting = this.settingRepo.create({ key, value, description });
    } else {
      setting.value = value;
      if (description !== undefined) setting.description = description;
    }
    return this.settingRepo.save(setting);
  }

  async listAll(): Promise<Setting[]> {
    return this.settingRepo.find({ order: { key: 'ASC' } });
  }

  async getReportTemplate(): Promise<any> {
    let raw = await this.getByKey('report_template');
    if (!raw) {
      raw = DEFAULT_REPORT_TEMPLATE;
      await this.set('report_template', raw, '报告模板字段配置');
    }
    try {
      return JSON.parse(raw);
    } catch {
      return JSON.parse(DEFAULT_REPORT_TEMPLATE);
    }
  }

  async updateReportTemplate(template: any): Promise<any> {
    await this.set('report_template', JSON.stringify(template), '报告模板字段配置');
    return template;
  }
}
