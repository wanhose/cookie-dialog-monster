import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import environment from 'services/environment';
import { octokit } from 'services/octokit';

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
          required: ['url', 'version'],
          type: 'object',
        },
      },
    },
    async (request, reply) => {
      const issues = await octokit.request('GET /repos/{owner}/{repo}/issues', {
        owner: environment.github.owner,
        repo: environment.github.repo,
      });
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
            `- <b>Reason:</b> ${request.body.reason ?? '-'}`,
            `- <b>URL:</b> ${request.body.url}`,
            `- <b>User-Agent:</b> ${request.body.userAgent ?? '-'}`,
            `- <b>Version:</b> ${request.body.version}`,
            `- <b>Explanation:</b> ${request.body.explanation || '-'}`,
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
