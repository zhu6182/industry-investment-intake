import { TianyanchaService } from './tianyancha.service';
import { QueryCompanyDto } from './dto/query-company.dto';
import { Repository } from 'typeorm';
import { Intake } from '../../entities/intake.entity';
export declare class IntakeLookupService {
    private readonly intakeRepo;
    constructor(intakeRepo: Repository<Intake>);
    checkExisting(companyName: string): Promise<boolean>;
}
export declare class IntakeLookupModule {
}
export declare class TianyanchaController {
    private readonly tycService;
    private readonly intakeLookup;
    constructor(tycService: TianyanchaService, intakeLookup: IntakeLookupService);
    search(dto: QueryCompanyDto): Promise<{
        total: number;
        items: import("./interfaces/tyc-response.interface").CompanySearchResult[];
    }>;
    validate(dto: QueryCompanyDto): Promise<import("./interfaces/tyc-response.interface").ValidationResult>;
    lookup(dto: QueryCompanyDto): Promise<{
        isValid: boolean;
        reasons: string[];
        rating: number;
        ratingBreakdown?: import("./interfaces/tyc-response.interface").RatingBreakdown;
        risk?: import("./interfaces/tyc-response.interface").RiskInfo;
        source?: "mcp";
        company: {
            name: string;
            creditCode?: string;
            legalPerson?: string;
            establishDate?: string;
            status?: string;
            registeredCapital?: string;
            industry?: string;
            shareholders: import("./interfaces/tyc-response.interface").Shareholder[];
        };
        exists: boolean;
        canProceed: boolean;
    }>;
}
