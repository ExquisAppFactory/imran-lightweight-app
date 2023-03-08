import nodemailer, { Transporter } from "nodemailer";

export class Email {
  readonly transport: Transporter;

  constructor() {
    this.transport = nodemailer.createTransport({
      port: parseInt(process.env.SMTP_PORT!),
      host: process.env.SMTP_HOST,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      from: "hi@isoterik.com",
    });
  }

  async sendMail(to: string | string[], subject: string, html: string) {
    return this.transport.sendMail({
      to: to,
      subject: subject,
      html: html,
    });
  }
}
