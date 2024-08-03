import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import { parseNewFix } from 'services/compatibility';

export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.get('/data/', async (_request, reply) => {
    try {
      const databaseUrl =
        'https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/main/database.json';
      const result = await (await fetch(databaseUrl)).json();

      reply.send({
        data: {
          ...result,
          fixes: result.fixes.map(parseNewFix),
        },
        success: true,
      });
    } catch (error) {
      reply.send({ success: false });
    }
  });

  done();
};
