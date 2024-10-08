export default {
  github: {
    files: 'https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/main',
    owner: 'wanhose',
    repo: 'cookie-dialog-monster',
    token: process.env.GITHUB_TOKEN ?? '',
  },
  port: (process.env.PORT ? Number(process.env.PORT) : undefined) ?? 8080,
};
