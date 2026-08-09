declare const _default: (() => {
    url: string;
    ssl: boolean | {
        rejectUnauthorized: boolean;
    };
    host?: undefined;
    port?: undefined;
    username?: undefined;
    password?: undefined;
    database?: undefined;
} | {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    url?: undefined;
    ssl?: undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string;
    ssl: boolean | {
        rejectUnauthorized: boolean;
    };
    host?: undefined;
    port?: undefined;
    username?: undefined;
    password?: undefined;
    database?: undefined;
} | {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    url?: undefined;
    ssl?: undefined;
}>;
export default _default;
