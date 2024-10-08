import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import environment from 'services/environment';

export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.get('/data/', async (_request, reply) => {
    try {
      const options = { headers: { 'Cache-Control': 'no-cache' } };
      const url = `${environment.github.files}/database.json`;
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
  });

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
