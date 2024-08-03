import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import v1EntriesRoutes from 'routes/v1/entries';
import v1ReportRoutes from 'routes/v1/report';
import v2DataRoutes from 'routes/v2/data';
import v2ReportRoutes from 'routes/v2/report';
import v3DataRoutes from 'routes/v3/data';
import v3ReportRoutes from 'routes/v3/report';
import v4DataRoutes from 'routes/v4/data';
import v4ReportRoutes from 'routes/v4/report';
import environment from 'services/environment';

const server = fastify({ logger: true });

server.register(cors, {
  origin: [
    /chrome-extension:\/\/[a-z]{32}/g,
    /moz-extension:\/\/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/g,
    'https://www.cookie-dialog-monster.com',
  ],
});

server.register(rateLimit, {
  global: false,
  max: 1,
  timeWindow: 30000,
});

server.register(v1EntriesRoutes, { prefix: '/rest/v1' });
server.register(v1ReportRoutes, { prefix: '/rest/v1' });
server.register(v2DataRoutes, { prefix: '/rest/v2' });
server.register(v2ReportRoutes, { prefix: '/rest/v2' });
server.register(v3DataRoutes, { prefix: '/rest/v3' });
server.register(v3ReportRoutes, { prefix: '/rest/v3' });
server.register(v4DataRoutes, { prefix: '/rest/v4' });
server.register(v4ReportRoutes, { prefix: '/rest/v4' });

server.listen({ host: '0.0.0.0', port: environment.port }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
