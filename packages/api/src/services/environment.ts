export default {
  gitea: {
    raw: process.env.GITEA_RAW ?? '',
    token: process.env.GITEA_TOKEN ?? '',
  },
  port: (process.env.PORT ? Number(process.env.PORT) : undefined) ?? 8080,
};
