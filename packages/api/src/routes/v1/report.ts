import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { sendMail } from 'services/mailing';

type PostReportBody = {
  html?: string;
  subject: string;
  text?: string;
  to: string;
};

export default (server: FastifyInstance, options: RouteShorthandOptions, done: () => void) => {
  server.post<{ Body: PostReportBody }>(
    '/report/',
    {
      schema: {
        body: {
          properties: {
            html: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            text: {
              type: 'string',
            },
            to: {
              type: 'string',
            },
          },
          required: ['subject', 'to'],
          type: 'object',
        },
      },
    },
    async (request, reply) => {
      const { html, subject, text, to } = request.body;

      sendMail({ html, text, to, subject });
      reply.send({ success: true });
    }
  );

  done();
};
