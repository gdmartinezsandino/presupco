import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import hbs from 'nodemailer-express-handlebars';

export interface BodyEmail {
  from?: string;
  to: string;
  subject: string;
  template: string;
  context?: Record<string, unknown>;
}

@Injectable()
export class MailingService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    this.configureTemplateEngine();
  }

  private configureTemplateEngine() {
    const viewsPath = join(process.cwd(), 'src', 'templates');

    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          layoutsDir: join(viewsPath, 'emails/layouts'),
          partialsDir: join(viewsPath, 'emails/partials'),
          defaultLayout: 'main',
          helpers: {
            currentYear: () => new Date().getFullYear()
          }
        },
        viewPath: join(viewsPath, 'emails'),
        extName: '.hbs',
      }),
    );
  }

  async send(body: BodyEmail) {
    const mailOptions = {
      from: body.from ?? process.env.MAIL_FROM,
      to: body.to,
      subject: body.subject,
      template: body.template,
      context: {
        ...(body.context ?? {}),
        appName: process.env.APP_NAME,
        appUrl: process.env.APP_URL,
        appSlogan: process.env.APP_SLOGAN,
      },
      attachments: [{
        filename: 'logo.png',
        path: join(process.cwd(), 'src/assets/logo.png'),
        cid: 'appLogo'
      }]
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`
        EMAIL
        from: ${mailOptions.from}
        to: ${body.to}
        subject: ${body.subject}
        template: ${body.template}
        ✅ Sent successfully!
      `);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw new Error('Email could not be sent.');
    }
  }
}
