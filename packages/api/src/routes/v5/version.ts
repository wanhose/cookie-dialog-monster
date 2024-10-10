import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import environment from 'services/environment';

export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.get('/version/', async (_request, reply) => {
    try {
      const options = { headers: { 'Cache-Control': 'no-cache' } };
      const url = `${environment.github.files}/packages/browser-extension/src/manifest.json`;
      const { version } = await (await fetch(url, options)).json();

      reply.send({
        data: {
          version,
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
