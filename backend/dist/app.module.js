"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const common_2 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_config_1 = __importDefault(require("./config/database.config"));
const redis_config_1 = __importDefault(require("./config/redis.config"));
const tianyancha_config_1 = __importDefault(require("./config/tianyancha.config"));
const roles_guard_1 = require("./common/guards/roles.guard");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const roles_module_1 = require("./modules/roles/roles.module");
const tianyancha_module_1 = require("./modules/tianyancha/tianyancha.module");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const region_entity_1 = require("./entities/region.entity");
const intake_entity_1 = require("./entities/intake.entity");
const intake_file_entity_1 = require("./entities/intake-file.entity");
const review_entity_1 = require("./entities/review.entity");
const report_entity_1 = require("./entities/report.entity");
const follow_up_entity_1 = require("./entities/follow-up.entity");
const visit_entity_1 = require("./entities/visit.entity");
const setting_entity_1 = require("./entities/setting.entity");
const referral_entity_1 = require("./entities/referral.entity");
const duplicate_check_log_entity_1 = require("./entities/duplicate-check-log.entity");
const upload_module_1 = require("./modules/upload/upload.module");
const intake_module_1 = require("./modules/intakes/intake.module");
const document_parser_module_1 = require("./modules/document-parser/document-parser.module");
const reports_module_1 = require("./modules/reports/reports.module");
const follow_ups_module_1 = require("./modules/follow-ups/follow-ups.module");
const visits_module_1 = require("./modules/visits/visits.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const bi_module_1 = require("./modules/bi/bi.module");
const regions_module_1 = require("./modules/regions/regions.module");
const settings_module_1 = require("./modules/settings/settings.module");
const duplicate_check_logs_module_1 = require("./modules/duplicate-check-logs/duplicate-check-logs.module");
const referrals_module_1 = require("./modules/referrals/referrals.module");
const rankings_module_1 = require("./modules/rankings/rankings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.default, redis_config_1.default, tianyancha_config_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const databaseUrl = config.get('database.url');
                    if (databaseUrl) {
                        return {
                            type: 'postgres',
                            url: databaseUrl,
                            ssl: (config.get('database.ssl') || false),
                            entities: [user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, region_entity_1.Region, intake_entity_1.Intake, intake_file_entity_1.IntakeFile, review_entity_1.Review, report_entity_1.Report, follow_up_entity_1.FollowUp, visit_entity_1.Visit, setting_entity_1.Setting, referral_entity_1.Referral, duplicate_check_log_entity_1.DuplicateCheckLog],
                            synchronize: true,
                            logging: false,
                            autoLoadEntities: false,
                        };
                    }
                    return {
                        type: 'better-sqlite3',
                        database: './data.db',
                        entities: [user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, region_entity_1.Region, intake_entity_1.Intake, intake_file_entity_1.IntakeFile, review_entity_1.Review, report_entity_1.Report, follow_up_entity_1.FollowUp, visit_entity_1.Visit, setting_entity_1.Setting, referral_entity_1.Referral, duplicate_check_log_entity_1.DuplicateCheckLog],
                        synchronize: true,
                        logging: false,
                    };
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            tianyancha_module_1.TianyanchaModule,
            upload_module_1.UploadModule,
            intake_module_1.IntakesModule,
            document_parser_module_1.DocumentParserModule,
            reports_module_1.ReportsModule,
            follow_ups_module_1.FollowUpsModule,
            visits_module_1.VisitsModule,
            dashboard_module_1.DashboardModule,
            bi_module_1.BiModule,
            regions_module_1.RegionsModule,
            settings_module_1.SettingsModule,
            duplicate_check_logs_module_1.DuplicateCheckLogsModule,
            referrals_module_1.ReferralsModule,
            rankings_module_1.RankingsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_PIPE,
                useValue: new common_2.ValidationPipe({
                    whitelist: true,
                    transform: true,
                    forbidNonWhitelisted: true,
                }),
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map