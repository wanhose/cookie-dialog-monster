import { FastifyInstance, RouteShorthandOptions } from 'fastify';

/**
 * @deprecated This API route is no longer supported. Please use a newer version
 */
export default (server: FastifyInstance, options: RouteShorthandOptions, done: () => void) => {
  server.get('/entries/', async (request, reply) => {
    reply.send({
      success: false,
      errors: ['This API route is no longer supported. Please use a newer version'],
    });
  });

  done();
};
