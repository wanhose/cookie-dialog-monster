import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import { parseNewFix } from 'services/compatibility';

export default (server: FastifyInstance, options: RouteShorthandOptions, done: () => void) => {
  server.get('/data/', async (request, reply) => {
    try {
      const databaseUrl =
        'https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/main/database.json';
      const result = await (await fetch(databaseUrl)).json();

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
    } catch (e) {
      console.error(e);
      reply.send({ success: false });
    }
  });

  done();
};
