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
      const result = await (await fetch(databaseUrl, fetchOptions)).json();

      reply.send({ data: result, success: true });
    } catch (error) {
      reply.send({
        errors: [error.message],
        success: false,
      });
    }
  });

  done();
};
