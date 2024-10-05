import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import environment from 'services/environment';
import { octokit } from 'services/octokit';
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
      schema: {
        params: GetIssuesParamsSchema,
      },
      validatorCompiler,
    },
    async (request, reply) => {
      try {
        const { hostname } = request.params;
        const existingIssues = await octokit.request('GET /search/issues', {
          per_page: 1,
          q: `in:title+is:issue+repo:${environment.github.owner}/${environment.github.repo}+${hostname}`,
        });
        const existingIssue = existingIssues.data.items[0];

        if (
          existingIssue &&
          (existingIssue.state === 'open' ||
            (existingIssue.state === 'closed' &&
              existingIssue.labels.some((label) => label.name === 'wontfix')))
        ) {
          reply.send({
            data: {
              flags: existingIssue.labels.map((label) => label.name),
              url: existingIssue.html_url,
            },
            success: true,
          });
        } else {
          reply.send({
            data: {},
            success: true,
          });
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
