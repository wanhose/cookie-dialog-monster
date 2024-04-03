import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';

export default (server: FastifyInstance, options: RouteShorthandOptions, done: () => void) => {
  server.get('/data/', async (request, reply) => {
    try {
      const dataUrl = 'https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/main/data';
      const commonWordsUrl = `${dataUrl}/common-words.json`;
      const fixesUrl = `${dataUrl}/fixes.txt`;
      const skipsUrl = `${dataUrl}/skips.json`;
      const tokensUrl = `${dataUrl}/tokens.txt`;

      const results = await Promise.all([
        fetch(commonWordsUrl),
        fetch(fixesUrl),
        fetch(skipsUrl),
        fetch(tokensUrl),
      ]);

      reply.send({
        data: {
          classes: (await results[3].json()).classes,
          commonWords: await results[0].json(),
          elements: (await results[3].json()).selectors,
          fixes: (await results[1].text()).split('\n').filter((x) => !!x),
          skips: (await results[2].json()).domains,
          tags: (await results[2].json()).tags,
        },
        success: true,
      });
    } catch {
      reply.send({ success: false });
    }
  });

  done();
};
