import nodemailer, { SendMailOptions } from 'nodemailer';
import environment from './environment';

const mailing = nodemailer.createTransport({
  auth: { pass: environment.mail.pass, user: environment.mail.user },
  host: 'smtp.zoho.eu',
  port: 465,
  secure: true,
});

export const sendMail = (options: SendMailOptions) =>
  mailing.sendMail({ ...options, from: environment.mail.user }, () => null);
