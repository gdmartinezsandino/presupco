import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const serviceConfig = app.get(ConfigService);

  try {
    // Security middleware
    app.use(helmet());

    // Type rateLimit directly as a RequestHandler factory
    const rateLimitFactory = rateLimit as (opts: {
      windowMs: number;
      max: number;
    }) => RequestHandler;

    const limiter = rateLimitFactory({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    });
    app.use(limiter);

    app.setGlobalPrefix('api/v1');
    app.enableCors({
      credentials: true,
      origin: serviceConfig.get<string>('WEBAPP_URL') || process.env.WEBAPP_URL,
    });

    // Explicitly type and call cookieParser middleware
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const cookieParserMiddleware = cookieParser();
    app.use(cookieParserMiddleware as RequestHandler);

    // swagger initialization
    const docOptions = new DocumentBuilder()
      .setTitle('PresupCo REST API')
      .setDescription('API REST for PresupCo App - Budget Management System')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controllers
      )
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('budgets', 'Budget management endpoints')
      .addTag('categories', 'Budget categories endpoints')
      .addTag('expenses', 'Expense tracking endpoints')
      .addTag('incomes', 'Income tracking endpoints')
      .addTag('reports', 'Financial reports endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, docOptions);
    SwaggerModule.setup('docs', app, document);

    await app.listen(serviceConfig.get('PORT') || 3000);

    const url = await app.getUrl();
    console.log(`Application is running on: ${url}`);
  } 
  catch (err: unknown) {
    // log safely and exit
    if (err instanceof Error) {
      console.error('Bootstrap failed:', err.stack || err.message);
    } else {
      console.error('Bootstrap failed:', String(err));
    }
    process.exit(1);
  }
}

void bootstrap();
