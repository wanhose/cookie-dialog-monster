import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import environment from 'services/environment';
import { octokit } from 'services/octokit';
import { validatorCompiler } from 'services/validation';
import { UAParser } from 'ua-parser-js';
import * as yup from 'yup';

const PostReportBodySchema = yup.object().shape({
  reason: yup.string().min(10).max(1000).required(),
  url: yup.string().max(1000).url().required(),
  userAgent: yup.string().max(1000).optional(),
  version: yup
    .string()
    .max(10)
    .matches(/^\d+(\.\d+){0,3}$/)
    .required(),
});

type PostReportBody = yup.InferType<typeof PostReportBodySchema>;

export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.post<{ Body: PostReportBody }>(
    '/report/',
    {
      schema: {
        body: PostReportBodySchema,
      },
      validatorCompiler,
    },
    async (request, reply) => {
      try {
        const issues = await octokit.request('GET /repos/{owner}/{repo}/issues', {
          owner: environment.github.owner,
          repo: environment.github.repo,
        });
        const ua = new UAParser(request.body.userAgent ?? '').getResult();
        const url = new URL(request.body.url).hostname
          .split('.')
          .slice(-3)
          .join('.')
          .replace('www.', '');

        if (issues.data.some((issue) => issue.title.includes(url))) {
          throw new Error();
        }

        await octokit.request('POST /repos/{owner}/{repo}/issues', {
          assignees: [environment.github.owner],
          body: [
            '## Specifications',
            '#### Browser',
            `${ua.browser.name ? `${ua.browser.name} ${ua.browser.version || ''}` : '-'}`,
            '#### Device',
            `${ua.device.type && ua.device.vendor ? `${ua.device.vendor} (${ua.device.type})` : '-'}`,
            '#### Reason',
            request.body.reason ?? '-',
            '#### URL',
            request.body.url,
            '#### Version',
            request.body.version,
          ].join('\n'),
          labels: ['bug'],
          owner: environment.github.owner,
          repo: environment.github.repo,
          title: url,
        });

        reply.send({ success: true });
      } catch (error) {
        reply.send({ errors: [error.message], success: false });
      }
    }
  );

  done();
};
