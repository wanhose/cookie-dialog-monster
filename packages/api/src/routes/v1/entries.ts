import { FastifyInstance, RouteShorthandOptions } from 'fastify';

/**
 * @deprecated This API route is no longer supported. Please use a newer version
 */
export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.get('/entries/', async (_request, reply) => {
    reply.send({
      success: false,
      errors: ['This API route is no longer supported. Please use a newer version'],
    });
  });

  done();
};
