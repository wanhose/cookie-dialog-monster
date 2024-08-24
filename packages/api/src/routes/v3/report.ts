import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import environment from 'services/environment';
import { octokit } from 'services/octokit';
import { UAParser } from 'ua-parser-js';

interface PostReportBody {
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
      const ua = new UAParser(request.body.userAgent ?? '').getResult();
      const url = new URL(request.body.url).hostname
        .split('.')
        .slice(-3)
        .join('.')
        .replace('www.', '');
      const existingIssues = await octokit.request('GET /search/issues', {
        per_page: 1,
        q: `in:title+is:issue+repo:${environment.github.owner}/${environment.github.repo}+${url}`,
      });
      const existingIssue = existingIssues.data.items[0];

      try {
        if (existingIssue) {
          if (existingIssue.state === 'closed') {
            await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
              owner: environment.github.owner,
              repo: environment.github.repo,
              issue_number: existingIssue.number,
              labels: ['bug'],
              state: 'open',
            });
          }

          await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
            owner: environment.github.owner,
            repo: environment.github.repo,
            issue_number: existingIssue.number,
            body: generateText(request.body, ua),
          });

          reply.send({
            data: existingIssue.html_url,
            success: true,
          });
          return;
        }

        const response = await octokit.request('POST /repos/{owner}/{repo}/issues', {
          assignees: [environment.github.owner],
          body: generateText(request.body, ua),
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
        });
      }
    }
  );

  done();
};

function generateText(body: PostReportBody, ua: UAParser.IResult): string {
  return [
    '## Issue information',
    ...(ua.browser.name && ua.browser.version
      ? ['#### 🖥️ Browser', `${ua.browser.name} (${ua.browser.version})`]
      : []),
    ...(ua.device.type && ua.device.vendor
      ? ['#### 📱 Device', `${ua.device.vendor} (${ua.device.type})`]
      : []),
    '#### 📝 Reason',
    body.reason ?? '-',
    '#### 🔗 URL',
    body.url,
    '#### 🏷️ Version',
    body.version,
  ].join('\n');
}
