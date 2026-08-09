import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = Number(process.env.PORT) || configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Backend server running on http://0.0.0.0:${port}`);
  logger.log(`📦 CORS origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : '*'}`);
  logger.log(`💾 UPLOAD_DIR: ${process.env.UPLOAD_DIR || '(default ./uploads)'}`);
  logger.log(`🗄  DATABASE: ${process.env.DATABASE_URL ? 'PostgreSQL (via DATABASE_URL)' : 'SQLite (./data.db)'}`);
}
bootstrap();
