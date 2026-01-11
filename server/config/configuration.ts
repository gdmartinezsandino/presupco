import * as Joi from 'joi';

export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.SERVER_PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'jwt-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',

  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_USERNAME: process.env.DB_USERNAME || 'presupco_user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'presupco_pass',
  DB_NAME: process.env.DB_NAME || 'presupco_db',

  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  MAIL_HOST: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
  MAIL_PORT: process.env.MAIL_PORT || '2525',
  MAIL_USER: process.env.MAIL_USER || '266da31ea32f5d',
  MAIL_PASS: process.env.MAIL_PASS || 'b65a996bdaea65',
  MAIL_FROM: process.env.MAIL_FROM || 'no-reply@presupco.io',

  WEBAPP_DOMAIN: process.env.WEBAPP_DOMAIN || 'localhost',
  WEBAPP_PORT: process.env.WEBAPP_PORT || 4200,
  WEBAPP_URL: process.env.WEBAPP_URL || 'http://localhost:4200',
});

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid(
    'development', 
    'production', 
    'test', 
  ),
  PORT: Joi.number().default(3000),  
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),

  // Database
  DB_HOST: Joi.string().required(), 
  DB_PORT: Joi.number().required(), 
  DB_USERNAME: Joi.string().required(), 
  DB_PASSWORD: Joi.string().required(), 
  DB_NAME: Joi.string().required(), 

  // Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),

  // Mailing
  MAIL_HOST: Joi.string(),
  MAIL_PORT: Joi.number(),
  MAIL_USER: Joi.string(),
  MAIL_PASS: Joi.string(),
  MAIL_FROM: Joi.string(),

  WEBAPP_DOMAIN: Joi.string().required(),
  WEBAPP_PORT: Joi.number().required(),
  WEBAPP_URL: Joi.string().required(),
});
