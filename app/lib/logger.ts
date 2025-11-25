// lib/logger.ts
type AnyObj = Record<string, unknown>;

const ON = process.env.DPPI_LOG?.trim() === '1' || process.env.DPPI_LOG === '*';

export function createLogger(ns: string) {
    const prefix = `[${ns}]`;

    function now() {
        return new Date().toISOString();
    }

    function fmt(msg: string, extra?: AnyObj) {
        if (!ON) return;
        if (extra) {
            // Hindari stringify error circular
            try {
                console.log(`${now()} ${prefix} ${msg}`, sanitize(extra));
            } catch {
                console.log(`${now()} ${prefix} ${msg}`);
            }
        } else {
            console.log(`${now()} ${prefix} ${msg}`);
        }
    }

    function sanitize(obj: AnyObj) {
        // Redaksi field sensitif
        const SENSITIVE_KEYS = ['cookie', 'authorization', 'password', 'pass', 'token', 'recaptcha'];
        const clone: any = Array.isArray(obj) ? [...(obj as any)] : { ...obj };
        for (const k of Object.keys(clone)) {
            const lower = k.toLowerCase();
            if (SENSITIVE_KEYS.some(s => lower.includes(s))) {
                clone[k] = '[REDACTED]';
            } else if (clone[k] && typeof clone[k] === 'object') {
                clone[k] = sanitize(clone[k] as AnyObj);
            }
        }
        return clone;
    }

    function timeStart(label: string, meta?: AnyObj) {
        const t0 = Date.now();
        fmt(`▶ ${label} start`, meta);
        return {
            end: (more?: AnyObj) => {
                const ms = Date.now() - t0;
                fmt(`■ ${label} end (${ms}ms)`, more ? { ...more, ms } : { ms });
            },
            error: (err?: unknown) => {
                const ms = Date.now() - t0;
                fmt(`✖ ${label} error (${ms}ms)`, { error: toErrObj(err), ms });
            },
        };
    }

    function toErrObj(err: unknown) {
        if (err instanceof Error) return { name: err.name, message: err.message, stack: err.stack?.split('\n').slice(0, 2).join(' | ') };
        return { error: String(err) };
    }

    return {
        log: (msg: string, extra?: AnyObj) => fmt(msg, extra),
        warn: (msg: string, extra?: AnyObj) => ON && console.warn(`${now()} ${prefix} ⚠ ${msg}`, extra ? sanitize(extra) : ''),
        error: (msg: string, err?: unknown) => ON && console.error(`${now()} ${prefix} ✖ ${msg}`, toErrObj(err)),
        timeStart,
    };
}

// Utility untuk membungkus fungsi async dan auto-log start/end
export function withLog<T extends (...args: any[]) => Promise<any>>(ns: string, label: string, fn: T) {
    const logger = createLogger(ns);
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const t = logger.timeStart(label);
        try {
            const res = await fn(...args);
            t.end();
            return res as ReturnType<T>;
        } catch (e) {
            t.error(e);
            throw e;
        }
    }) as T;
}
