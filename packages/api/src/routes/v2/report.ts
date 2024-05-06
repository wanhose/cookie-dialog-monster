import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import environment from 'services/environment';
import { octokit } from 'services/octokit';
import { UAParser } from 'ua-parser-js';

type PostReportBody = {
  reason?: string;
  url: string;
  userAgent?: string;
  version: string;
};

export default (server: FastifyInstance, options: RouteShorthandOptions, done: () => void) => {
  server.post<{ Body: PostReportBody }>(
    '/report/',
    {
      schema: {
        body: {
          properties: {
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
          required: ['url', 'version'],
          type: 'object',
        },
      },
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
