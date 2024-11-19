import type { FastifyRequest } from 'fastify';

export const RATE_LIMIT_1_PER_HOUR = {
  max: 1,
  timeWindow: '1 hour',
};

export const RATE_LIMIT_1_PER_MIN = {
  max: 1,
  timeWindow: '1 minute',
};

export const RATE_LIMIT_10_PER_MIN = {
  max: 10,
  timeWindow: '1 minute',
};

export const RATE_LIMIT_3_PER_MIN = {
  max: 3,
  timeWindow: '1 minute',
};

export function keyGenerator(req: FastifyRequest): string {
  const userIdentifier = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip;

  return `${userIdentifier}:${req.routerPath}`;
}
