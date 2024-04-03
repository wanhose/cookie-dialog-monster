import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';

export default (server: FastifyInstance, options: RouteShorthandOptions, done: () => void) => {
  server.get('/data/', async (request, reply) => {
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
      const skips = await results[2].json();
      const tokens = await results[3].json();

      reply.send({
        data: {
          classes: tokens.classes,
          commonWords: await results[0].json(),
          elements: tokens.selectors,
          fixes: (await results[1].text()).split('\n').filter((x) => !!x),
          skips: skips.domains,
          tags: skips.tags,
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
