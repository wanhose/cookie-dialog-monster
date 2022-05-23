import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';

export default (server: FastifyInstance, options: RouteShorthandOptions, done: () => void) => {
  server.get('/entries/', async (request, reply) => {
    try {
      const repositoryUrl = 'https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/main';
      const dataUrl = `${repositoryUrl}/data/elements.txt`;
      const entriesLength = (await (await fetch(dataUrl)).text()).split('\n').length;

      reply.send({ entries: entriesLength, success: true });
    } catch {
      reply.send({ success: false });
    }
  });

  done();
};
