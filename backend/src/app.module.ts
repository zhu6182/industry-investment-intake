import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import tianyanchaConfig from './config/tianyancha.config';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { TianyanchaModule } from './modules/tianyancha/tianyancha.module';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Region } from './entities/region.entity';
import { Intake } from './entities/intake.entity';
import { IntakeFile } from './entities/intake-file.entity';
import { Review } from './entities/review.entity';
import { Report } from './entities/report.entity';
import { FollowUp } from './entities/follow-up.entity';
import { Visit } from './entities/visit.entity';
import { Setting } from './entities/setting.entity';
import { Referral } from './entities/referral.entity';
import { DuplicateCheckLog } from './entities/duplicate-check-log.entity';
import { UploadModule } from './modules/upload/upload.module';
import { IntakesModule } from './modules/intakes/intake.module';
import { DocumentParserModule } from './modules/document-parser/document-parser.module';
import { ReportsModule } from './modules/reports/reports.module';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module';
import { VisitsModule } from './modules/visits/visits.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BiModule } from './modules/bi/bi.module';
import { RegionsModule } from './modules/regions/regions.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DuplicateCheckLogsModule } from './modules/duplicate-check-logs/duplicate-check-logs.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { RankingsModule } from './modules/rankings/rankings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, tianyanchaConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('database.url');
        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            ssl: (config.get<any>('database.ssl') || false) as any,
            entities: [User, Role, Permission, Region, Intake, IntakeFile, Review, Report, FollowUp, Visit, Setting, Referral, DuplicateCheckLog],
            synchronize: true,
            logging: false,
            autoLoadEntities: false,
          };
        }
        return {
          type: 'better-sqlite3' as const,
          database: './data.db',
          entities: [User, Role, Permission, Region, Intake, IntakeFile, Review, Report, FollowUp, Visit, Setting, Referral, DuplicateCheckLog],
          synchronize: true,
          logging: false,
        };
      },
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    TianyanchaModule,
    UploadModule,
    IntakesModule,
    DocumentParserModule,
    ReportsModule,
    FollowUpsModule,
    VisitsModule,
    DashboardModule,
    BiModule,
    RegionsModule,
    SettingsModule,
    DuplicateCheckLogsModule,
    ReferralsModule,
    RankingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule {}
