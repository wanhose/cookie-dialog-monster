import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';

export default (server: FastifyInstance, options: RouteShorthandOptions, done: () => void) => {
  server.get('/data/', async (request, reply) => {
    try {
      const dataUrl = 'https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/main/data';
      const classesUrl = `${dataUrl}/classes.txt`;
      const elementsUrl = `${dataUrl}/elements.txt`;
      const fixesUrl = `${dataUrl}/fixes.txt`;
      const skipsUrl = `${dataUrl}/skips.txt`;
      const tagsUrl = `${dataUrl}/tags.txt`;

      const results = await Promise.all([
        fetch(classesUrl),
        fetch(elementsUrl),
        fetch(fixesUrl),
        fetch(skipsUrl),
        fetch(tagsUrl),
      ]);

      reply.send({
        data: {
          classes: (await results[0].text()).split('\n'),
          commonWords: [
            'banner',
            'cc',
            'cmp',
            'compliance',
            'consent',
            'cookie',
            'dialog',
            'disclaimer',
            'gdpr',
            'law',
            'policy',
            'popup',
            'privacy',
          ],
          elements: (await results[1].text()).split('\n'),
          fixes: (await results[2].text()).split('\n'),
          skips: (await results[3].text()).split('\n'),
          tags: (await results[4].text()).split('\n'),
        },
        success: true,
      });
    } catch {
      reply.send({ success: false });
    }
  });

  done();
};
