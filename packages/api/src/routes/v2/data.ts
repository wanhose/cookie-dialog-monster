import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import { parseAction } from 'services/compatibility';
import environment from 'services/environment';
import { RATE_LIMIT_10_PER_MIN } from 'services/rateLimit';

export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.get(
    '/data/',
    {
      config: {
        rateLimit: RATE_LIMIT_10_PER_MIN,
      },
    },
    async (_request, reply) => {
      try {
        const database = `${environment.github.raw}/database.json`;
        const response = await fetch(database);
        const { actions, exclusions, keywords, tokens } = await response.json();

        reply.send({
          data: {
            classes: tokens.classes,
            commonWords: keywords,
            elements: tokens.selectors,
            fixes: actions.map(parseAction),
            skips: exclusions.overflows,
            tags: exclusions.tags,
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
