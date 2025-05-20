import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import environment from 'services/environment';
import { RATE_LIMIT_10_PER_MIN } from 'services/rateLimit';

export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.get(
    '/version/',
    {
      config: {
        rateLimit: RATE_LIMIT_10_PER_MIN,
      },
    },
    async (_request, reply) => {
      try {
        const manifest = `${environment.github.raw}/packages/browser-extension/src/manifest.json`;
        const options = { headers: { 'Cache-Control': 'no-cache' } };
        const response = await fetch(manifest, options);
        const { version } = await response.json();

        reply.send({
          data: version,
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
