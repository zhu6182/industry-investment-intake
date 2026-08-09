import { Repository } from 'typeorm';
import { Setting } from '../../entities/setting.entity';
export declare class SettingsService {
    private settingRepo;
    constructor(settingRepo: Repository<Setting>);
    getByKey(key: string): Promise<string | null>;
    set(key: string, value: string, description?: string): Promise<Setting>;
    listAll(): Promise<Setting[]>;
    getReportTemplate(): Promise<any>;
    updateReportTemplate(template: any): Promise<any>;
}
