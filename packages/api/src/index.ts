import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import v1ReportRoutes from 'routes/v1/report';
import environment from 'services/environment';

const server = fastify({ logger: true });

server.register(cors, {
  origin: (origin, callback) => {
    const chrome = /chrome-extension:\/\/[a-z]{32}/g;
    const moz =
      /moz-extension:\/\/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/g;

    if (chrome.test(origin) || moz.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed'), false);
  },
});

server.register(rateLimit, { max: 1, timeWindow: 30000 });

server.register(v1ReportRoutes, { prefix: '/rest/v1' });

server.listen(environment.port, '0.0.0.0', (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
