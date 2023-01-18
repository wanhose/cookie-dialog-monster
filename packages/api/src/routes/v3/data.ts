import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';

export default (server: FastifyInstance, options: RouteShorthandOptions, done: () => void) => {
  server.get('/data/', async (request, reply) => {
    try {
      const dataUrl = 'https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/v7.0.0/data';
      const actionsUrl = `${dataUrl}/actions.json`;
      const tokensUrl = `${dataUrl}/tokens.json`;

      const results = await Promise.all([fetch(actionsUrl), fetch(tokensUrl)]);

      reply.send({
        data: {
          actions: await results[0].json(),
          tokens: await results[1].json(),
        },
        success: true,
      });
    } catch {
      reply.send({ success: false });
    }
  });

  done();
};
