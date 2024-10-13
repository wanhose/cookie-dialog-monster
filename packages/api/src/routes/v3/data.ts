import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import { parseNewFix } from 'services/compatibility';
import environment from 'services/environment';
import { RATE_LIMIT_3_PER_MIN } from 'services/rateLimit';

export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.get(
    '/data/',
    {
      config: {
        rateLimit: RATE_LIMIT_3_PER_MIN,
      },
    },
    async (_request, reply) => {
      try {
        const url = `${environment.gitea.raw}/database.json`;
        const result = await (await fetch(url)).json();

        reply.send({
          data: {
            ...result,
            fixes: result.fixes.map(parseNewFix),
          },
          success: true,
        });
      } catch (error) {
        reply.send({
          errors: [error.message],
          success: false,
        });
      }
    }
  );

  done();
};
