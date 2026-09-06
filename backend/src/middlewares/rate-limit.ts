import type { Core } from '@strapi/strapi';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export default (config: Record<string, unknown>, { strapi }: { strapi: Core.Strapi }) => {
  const requestCounts = new Map<string, RateLimitRecord>();
  const WINDOW_MS = 60 * 1000; // 1 menit
  const MAX_REQUESTS = 120; // 120 request per menit per IP

  // Cleanup memori setiap 5 menit
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of requestCounts.entries()) {
      if (now > record.resetTime) {
        requestCounts.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return async (ctx: any, next: () => Promise<void>) => {
    // Hanya batasi endpoint /api/*, jangan batasi admin panel atau assets statis
    if (!ctx.path.startsWith('/api')) {
      return next();
    }

    const clientIp =
      (typeof ctx.request.headers['x-forwarded-for'] === 'string'
        ? ctx.request.headers['x-forwarded-for'].split(',')[0].trim()
        : null) ||
      ctx.ip ||
      ctx.request.ip ||
      '127.0.0.1';

    const now = Date.now();
    const record = requestCounts.get(clientIp);

    if (!record || now > record.resetTime) {
      requestCounts.set(clientIp, { count: 1, resetTime: now + WINDOW_MS });
    } else {
      record.count += 1;
      if (record.count > MAX_REQUESTS) {
        ctx.status = 429;
        ctx.set('Retry-After', String(Math.ceil((record.resetTime - now) / 1000)));
        ctx.body = {
          data: null,
          error: {
            status: 429,
            name: 'RateLimitError',
            message: 'Terlalu banyak permintaan (Rate limit exceeded). Silakan coba beberapa saat lagi.',
          },
        };
        return;
      }
    }

    await next();
  };
};
