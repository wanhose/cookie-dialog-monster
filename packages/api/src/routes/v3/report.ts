import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import environment from 'services/environment';
import { octokit } from 'services/octokit';
import { UAParser } from 'ua-parser-js';

interface PostReportBody {
  readonly explanation?: string;
  readonly reason?: string;
  readonly url: string;
  readonly userAgent?: string;
  readonly version: string;
}

export default (server: FastifyInstance, _options: RouteShorthandOptions, done: () => void) => {
  server.post<{ Body: PostReportBody }>(
    '/report/',
    {
      schema: {
        body: {
          properties: {
            explanation: {
              type: 'string',
            },
            reason: {
              type: 'string',
            },
            url: {
              type: 'string',
            },
            userAgent: {
              type: 'string',
            },
            version: {
              type: 'string',
            },
          },
          required: ['reason', 'url', 'version'],
          type: 'object',
        },
      },
    },
    async (request, reply) => {
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
      const existingIssue = issues.data.find((issue) => issue.title.includes(url));

      try {
        if (existingIssue) {
          throw new Error('Issue already exists');
        }

        const response = await octokit.request('POST /repos/{owner}/{repo}/issues', {
          assignees: [environment.github.owner],
          body: [
            '## Specifications',
            ...(ua.browser.name && ua.browser.version
              ? ['#### Browser', `${ua.browser.name} (${ua.browser.version})`]
              : []),
            ...(ua.device.type && ua.device.vendor
              ? ['#### Device', `${ua.device.vendor} (${ua.device.type})`]
              : []),
            ...(request.body.explanation ? ['#### Explanation', request.body.explanation] : []),
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

        reply.send({
          data: response.data.html_url,
          success: true,
        });
      } catch (error) {
        reply.send({
          errors: [error.message],
          success: false,
          data: existingIssue?.html_url,
        });
      }
    }
  );

  done();
};
