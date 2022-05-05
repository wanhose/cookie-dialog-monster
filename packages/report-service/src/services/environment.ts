import dotenv from 'dotenv';

dotenv.config();

export default {
  extension: {
    chrome: process.env.CHROME_EXTENSION_ID ?? '',
  },
  mail: {
    pass: process.env.MAIL_PASS ?? '',
    user: process.env.MAIL_USER ?? '',
  },
  port: process.env.PORT ?? 8080,
};
