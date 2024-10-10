import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import { parseNewFix } from 'services/compatibility';
import environment from 'services/environment';

export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.get('/data/', async (_request, reply) => {
    try {
      const url = `${environment.github.files}/database.json`;
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
    } catch (e) {
      console.error(e);
      reply.send({ success: false });
    }
  });

  done();
};
