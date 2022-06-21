import dotenv from 'dotenv';

dotenv.config();

export default {
  mail: {
    pass: process.env.MAIL_PASS ?? '',
    user: process.env.MAIL_USER ?? '',
  },
  port: (process.env.PORT ? Number(process.env.PORT) : undefined) ?? 8080,
};
