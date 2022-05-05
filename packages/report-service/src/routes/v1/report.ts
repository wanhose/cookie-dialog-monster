import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { sendMail } from 'services/mailing';

type PostReportBody = {
  subject: string;
  text: string;
  to: string;
};

export default (
  server: FastifyInstance,
  options: RouteShorthandOptions,
  done: () => void
) => {
  server.post<{ Body: PostReportBody }>(
    '/report/',
    {
      schema: {
        body: {
          properties: {
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
          required: ['subject', 'text', 'to'],
          type: 'object',
        },
      },
    },
    async (request, reply) => {
      const { subject, text, to } = request.body;

      sendMail({ text, to, subject });
      reply.send({ success: true });
    }
  );

  done();
};
