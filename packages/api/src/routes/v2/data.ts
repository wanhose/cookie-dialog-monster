import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import { parseNewFix } from 'services/compatibility';
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
        const url = `${environment.gitea.raw}/database.json`;
        const result = await (await fetch(url)).json();

        reply.send({
          data: {
            classes: result.tokens.classes,
            commonWords: result.commonWords,
            elements: result.tokens.selectors,
            fixes: result.fixes.map(parseNewFix),
            skips: result.skips.domains,
            tags: result.skips.tags,
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
