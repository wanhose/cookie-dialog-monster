export default {
  github: {
    raw: process.env.GITHUB_RAW ?? '',
    token: process.env.GITHUB_TOKEN ?? '',
  },
  port: (process.env.PORT ? Number(process.env.PORT) : undefined) ?? 8080,
};
