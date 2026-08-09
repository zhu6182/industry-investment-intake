import { registerAs } from '@nestjs/config';

export default registerAs('tianyancha', () => ({
  appKey: process.env.TYC_APP_KEY || '',
  secretKey: process.env.TYC_SECRET_KEY || '',
  baseUrl:
    process.env.TYC_BASE_URL || 'https://open.api.tianyancha.com/services/open',
  cacheTtl: Number(process.env.TYC_CACHE_TTL) || 604800,
  requestTimeout: Number(process.env.TYC_REQUEST_TIMEOUT) || 10000,
}));
