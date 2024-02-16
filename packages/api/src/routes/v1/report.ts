import { FastifyInstance, RouteShorthandOptions } from 'fastify';

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
          properties: {},
          required: [],
          type: 'object',
        },
      },
    },
    async (_request, reply) => {
      reply.status(500).send({
        success: false,
        errors: ['This API route is no longer supported in Mozilla Firefox'],
      });
    }
  );

  done();
};
