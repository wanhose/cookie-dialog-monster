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
      const { reason, url, userAgent, version } = request.body;
      const ua = new UAParser(userAgent ?? '').getResult();
      const hostname = new URL(url).hostname.split('.').slice(-3).join('.').replace('www.', '');
      const existingIssues = await octokit.request('GET /search/issues', {
        per_page: 50,
        q: `in:title+is:issue+repo:${environment.github.owner}/${environment.github.repo}+${hostname}`,
      });
      const existingIssue = existingIssues.data.items.find((issue) => hostname === issue.title);

      try {
        if (existingIssue) {
          if (existingIssue.labels.some((label) => label.name === 'wontfix')) {
            reply.send({
              data: existingIssue.html_url,
              errors: ['This issue has been marked as "wontfix" and will not be addressed.'],
              success: false,
            });
            return;
          }

          if (existingIssue.state === 'open') {
            reply.send({
              data: existingIssue.html_url,
              errors: [
                'This issue already exists. Please refer to the existing issue for updates.',
              ],
              success: false,
            });
            return;
          }

          await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
            issue_number: existingIssue.number,
            labels: ['bug'],
            owner: environment.github.owner,
            repo: environment.github.repo,
            state: 'open',
          });

          reply.send({
            data: existingIssue.html_url,
            success: true,
          });
          return;
        }

        const response = await octokit.request('POST /repos/{owner}/{repo}/issues', {
          assignees: [environment.github.owner],
          body: [
            '## Issue information',
            ...(ua.browser.name && ua.browser.version
              ? ['#### 🖥️ Browser', `${ua.browser.name} (${ua.browser.version})`]
              : []),
            ...(ua.device.type && ua.device.vendor
              ? ['#### 📱 Device', `${ua.device.vendor} (${ua.device.type})`]
              : []),
            '#### 📝 Reason',
            reason,
            '#### 🔗 URL',
            url,
            '#### 🏷️ Version',
            version,
          ].join('\n'),
          labels: ['bug'],
          owner: environment.github.owner,
          repo: environment.github.repo,
          title: hostname,
        });

        reply.send({
          data: response.data.html_url,
          success: true,
        });
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
