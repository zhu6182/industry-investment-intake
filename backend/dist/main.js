"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_2 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    const allowedOrigins = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    app.enableCors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_2.Reflector)));
    const port = Number(process.env.PORT) || configService.get('PORT') || 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Backend server running on http://0.0.0.0:${port}`);
    logger.log(`📦 CORS origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : '*'}`);
    logger.log(`💾 UPLOAD_DIR: ${process.env.UPLOAD_DIR || '(default ./uploads)'}`);
    logger.log(`🗄  DATABASE: ${process.env.DATABASE_URL ? 'PostgreSQL (via DATABASE_URL)' : 'SQLite (./data.db)'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map