import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { getIssue } from 'services/git';
import { RATE_LIMIT_10_PER_MIN } from 'services/rateLimit';
import { validatorCompiler } from 'services/validation';
import * as yup from 'yup';

const GetIssuesParamsSchema = yup.object().shape({
  hostname: yup.string().required(),
});

type GetIssuesParams = yup.InferType<typeof GetIssuesParamsSchema>;

export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.get<{ Params: GetIssuesParams }>(
    '/issues/:hostname',
    {
      config: {
        rateLimit: RATE_LIMIT_10_PER_MIN,
      },
      schema: {
        params: GetIssuesParamsSchema,
      },
      validatorCompiler,
    },
    async (request, reply) => {
      try {
        const { hostname } = request.params;
        const issue = await getIssue({ title: hostname });

        if (
          issue &&
          ((issue.state === 'closed' && issue.labels.some((label) => label.name === 'wontfix')) ||
            issue.state === 'open')
        ) {
          reply.send({
            data: {
              flags: issue.labels.map((label) => label.name),
              url: issue.html_url,
            },
            success: true,
          });
        } else {
          throw new Error('Failed to find issue');
        }
      } catch (error) {
        reply.send({
          errors: [error.message],
          success: false,
        });
      }
    }
  );

  done();
};
