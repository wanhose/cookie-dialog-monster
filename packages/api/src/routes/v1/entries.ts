import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { RATE_LIMIT_1_PER_HOUR } from 'services/rateLimit';

/**
 * @deprecated This API route is no longer supported. Please use a newer version
 */
export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.get(
    '/entries/',
    {
      config: {
        rateLimit: RATE_LIMIT_1_PER_HOUR,
      },
    },
    async (_request, reply) => {
      reply.send({
        success: false,
        errors: ['This API route is no longer supported. Please use a newer version'],
      });
    }
  );

  done();
};
