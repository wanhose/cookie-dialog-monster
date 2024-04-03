import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';

export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.get('/data/', async (_request, reply) => {
    try {
      const dataUrl = 'https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/main/data';
      const commonWordsUrl = `${dataUrl}/common-words.json`;
      const fixesUrl = `${dataUrl}/fixes.txt`;
      const skipsUrl = `${dataUrl}/skips.json`;
      const tokensUrl = `${dataUrl}/tokens.json`;

      const results = await Promise.all([
        fetch(commonWordsUrl),
        fetch(fixesUrl),
        fetch(skipsUrl),
        fetch(tokensUrl),
      ]);

      reply.send({
        data: {
          commonWords: await results[0].json(),
          fixes: (await results[1].text()).split('\n').filter((x) => !!x),
          skips: await results[2].json(),
          tokens: await results[3].json(),
        },
        success: true,
      });
    } catch (error) {
      reply.send({ success: false });
    }
  });

  done();
};
