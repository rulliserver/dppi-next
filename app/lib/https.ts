// lib/http.ts
import axios from 'axios';
import { createLogger } from './logger';

const log = createLogger('http');

export const http = axios.create({
    // baseURL optional; kita pakai full URL di pemanggil biar fleksibel
    timeout: 15_000,
    // withCredentials tidak perlu di server; kita forward cookie manual via headers
});

http.interceptors.request.use((config) => {
    const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
    const method = (config.method || 'get').toUpperCase();
    (config as any).__t0 = Date.now();
    log.log(`REQ ${method} ${url}`, {
        params: config.params,
        headers: { cookie: config.headers?.Cookie ? '[REDACTED]' : undefined },
    });
    return config;
});

http.interceptors.response.use(
    (res) => {
        const url = `${res.config.baseURL ?? ''}${res.config.url ?? ''}`;
        const method = (res.config.method || 'get').toUpperCase();
        const t0 = (res.config as any).__t0 as number | undefined;
        const ms = t0 ? Date.now() - t0 : undefined;
        log.log(`RES ${method} ${url}`, { status: res.status, ms });
        return res;
    },
    (err) => {
        const cfg = err?.config || {};
        const url = `${cfg.baseURL ?? ''}${cfg.url ?? ''}`;
        const method = (cfg.method || 'get').toUpperCase();
        const t0 = (cfg as any).__t0 as number | undefined;
        const ms = t0 ? Date.now() - t0 : undefined;
        const status = err?.response?.status;
        const dataMsg = err?.response?.data?.message;
        log.error(`ERR ${method} ${url} (${status ?? 'no-status'}) ${ms ?? '-'}ms`, dataMsg || err);
        return Promise.reject(err);
    }
);
