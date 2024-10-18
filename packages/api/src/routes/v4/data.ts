import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import { parseActionName, toDeclarativeNetRequestRule } from 'services/compatibility';
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
        const database = `${environment.gitea.raw}/database.json`;
        const options = { headers: { 'Cache-Control': 'no-cache' } };
        const response = await fetch(database, options);
        const { actions, exclusions, keywords, rules, ...rest } = await response.json();

        reply.send({
          data: {
            ...rest,
            actions: actions.map(parseActionName),
            commonWords: keywords,
            rules: rules.map(toDeclarativeNetRequestRule),
            skips: { domains: exclusions.overflows, tags: exclusions.tags },
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
