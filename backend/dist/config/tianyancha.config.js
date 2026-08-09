"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('tianyancha', () => ({
    appKey: process.env.TYC_APP_KEY || '',
    secretKey: process.env.TYC_SECRET_KEY || '',
    baseUrl: process.env.TYC_BASE_URL || 'https://open.api.tianyancha.com/services/open',
    cacheTtl: Number(process.env.TYC_CACHE_TTL) || 604800,
    requestTimeout: Number(process.env.TYC_REQUEST_TIMEOUT) || 10000,
}));
//# sourceMappingURL=tianyancha.config.js.map