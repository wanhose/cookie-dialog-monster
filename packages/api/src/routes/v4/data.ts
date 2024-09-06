import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';

export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.get('/data/', async (_request, reply) => {
    try {
      const databaseUrl =
        'https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/main/database.json';
      const fetchOptions = {
        headers: { 'Cache-Control': 'no-cache' },
      };
      const { rules, ...result } = await (await fetch(databaseUrl, fetchOptions)).json();

      reply.send({
        data: {
          ...result,
          rules: (rules as readonly string[]).map((urlFilter, index) => ({
            id: index + 1,
            priority: 1,
            action: {
              type: 'block',
            },
            condition: {
              resourceTypes: [
                'font',
                'image',
                'media',
                'object',
                'script',
                'stylesheet',
                'xmlhttprequest',
              ],
              urlFilter,
            },
          })),
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
