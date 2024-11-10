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
import v5DataRoutes from 'routes/v5/data';
import v5IssuesRoutes from 'routes/v5/issues';
import v5ReportRoutes from 'routes/v5/report';
import v6DataRoutes from 'routes/v6/data';
import v6IssuesRoutes from 'routes/v6/issues';
import v6ReportRoutes from 'routes/v6/report';
import v6VersionRoutes from 'routes/v6/version';
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
});

server.register(v1EntriesRoutes, { prefix: '/rest/v1' });
server.register(v1ReportRoutes, { prefix: '/rest/v1' });
server.register(v2DataRoutes, { prefix: '/rest/v2' });
server.register(v2ReportRoutes, { prefix: '/rest/v2' });
server.register(v3DataRoutes, { prefix: '/rest/v3' });
server.register(v3ReportRoutes, { prefix: '/rest/v3' });
server.register(v4DataRoutes, { prefix: '/rest/v4' });
server.register(v4ReportRoutes, { prefix: '/rest/v4' });
server.register(v5DataRoutes, { prefix: '/rest/v5' });
server.register(v5IssuesRoutes, { prefix: '/rest/v5' });
server.register(v5ReportRoutes, { prefix: '/rest/v5' });
server.register(v6DataRoutes, { prefix: '/rest/v6' });
server.register(v6IssuesRoutes, { prefix: '/rest/v6' });
server.register(v6ReportRoutes, { prefix: '/rest/v6' });
server.register(v6VersionRoutes, { prefix: '/rest/v6' });

server.listen({ host: '0.0.0.0', port: environment.port }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
