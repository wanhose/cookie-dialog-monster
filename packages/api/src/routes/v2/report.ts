import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { sendMail } from 'services/mailing';

type PostReportBody = {
  url: string;
  version: string;
};

export default (server: FastifyInstance, options: RouteShorthandOptions, done: () => void) => {
  server.post<{ Body: PostReportBody }>(
    '/report/',
    {
      schema: {
        body: {
          properties: {
            url: {
              type: 'string',
            },
            version: {
              type: 'string',
            },
          },
          required: ['url', 'version'],
          type: 'object',
        },
      },
    },
    async (request, reply) => {
      const { url, version } = request.body;
      const html = `<b>Site:</b> ${url}<br/><b>Version:</b> ${version}`;
      const subject = 'Cookie Dialog Monster Report';
      const to = 'hello@wanhose.dev';

      sendMail({ html, to, subject });
      reply.send({ success: true });
    }
  );

  done();
};
