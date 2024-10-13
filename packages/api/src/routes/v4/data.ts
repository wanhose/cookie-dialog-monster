import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
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
        const options = { headers: { 'Cache-Control': 'no-cache' } };
        const url = `${environment.gitea.raw}/database.json`;
        const { rules, ...result } = await (await fetch(url, options)).json();

        reply.send({
          data: {
            ...result,
            rules: rules.map(toDeclarativeNetRequestRule),
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

function toDeclarativeNetRequestRule(urlFilter: string, index: number) {
  return {
    action: {
      type: 'block',
    },
    condition: {
      resourceTypes: ['font', 'image', 'media', 'object', 'script', 'stylesheet', 'xmlhttprequest'],
      urlFilter,
    },
    id: index + 1,
    priority: 1,
  };
}
