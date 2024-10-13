import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { formatMessage } from 'services/format';
import { createIssue, getIssue, updateIssue } from 'services/git';
import { RATE_LIMIT_1_PER_MIN } from 'services/rateLimit';
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
      config: {
        rateLimit: RATE_LIMIT_1_PER_MIN,
      },
      schema: {
        body: PostReportBodySchema,
      },
      validatorCompiler,
    },
    async (request, reply) => {
      try {
        const { reason, url, userAgent, version } = request.body;
        const hostname = new URL(url).hostname.split('.').slice(-3).join('.').replace('www.', '');
        const issue = await getIssue({ title: hostname });
        const ua = new UAParser(userAgent ?? '').getResult();

        if (issue) {
          if (issue.labels.some((label) => label.name === 'wontfix')) {
            reply.send({
              data: issue.html_url,
              errors: ['This issue has been marked as "wontfix" and will not be addressed.'],
              success: false,
            });
            return;
          }

          if (issue.state === 'open') {
            reply.send({
              data: issue.html_url,
              errors: [
                'This issue already exists. Please refer to the existing issue for updates.',
              ],
              success: false,
            });
            return;
          }

          await updateIssue({
            id: issue.id,
            labels: ['bug'],
            state: 'open',
          });

          reply.send({
            data: issue.html_url,
            success: true,
          });
          return;
        }

        const newIssue = await createIssue({
          description: formatMessage({ reason, ua, url, version }),
          labels: ['bug'],
          title: hostname,
        });

        reply.send({
          data: newIssue.html_url,
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
