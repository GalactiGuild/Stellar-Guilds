/**
 * Environment configuration validation schema using Joi.
 *
 * Required env vars: PORT, DATABASE_URL, JWT_SECRET
 * Conditional: REDIS_URL (required unless QUEUE_DISABLED=true)
 *
 * Usage: import in AppModule and pass to ConfigModule.forRoot({ validationSchema })
 *
 * Install: npm install joi
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Joi = require('joi');

export const configValidationSchema = Joi.object({
  // Server
  PORT: Joi.number().default(3000).optional(),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Database (required)
  DATABASE_URL: Joi.string().required().messages({
    'any.required': 'Missing Configuration: DATABASE_URL',
    'string.empty': 'Missing Configuration: DATABASE_URL',
  }),

  // Auth (required)
  JWT_SECRET: Joi.string().min(16).required().messages({
    'any.required': 'Missing Configuration: JWT_SECRET',
    'string.empty': 'Missing Configuration: JWT_SECRET',
    'string.min': 'JWT_SECRET must be at least 16 characters',
  }),
  JWT_EXPIRES_IN: Joi.string().default('1d').optional(),

  // Redis / Queue (required unless queue disabled)
  REDIS_URL: Joi.when('QUEUE_DISABLED', {
    is: Joi.exist().valid('true', '1', 'true'),
    then: Joi.string().optional(),
    otherwise: Joi.string().required().messages({
      'any.required': 'Missing Configuration: REDIS_URL (required when queue is enabled)',
    }),
  }),
  QUEUE_DISABLED: Joi.string()
    .valid('true', '1', 'false', '0')
    .optional(),

  // Storage
  STORAGE_PROVIDER: Joi.string()
    .valid('local', 's3', 'ipfs')
    .default('local')
    .optional(),
  STORAGE_LOCAL_DIR: Joi.string().optional(),
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_S3_BUCKET: Joi.string().optional(),
  AWS_REGION: Joi.string().optional(),

  // Mail
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),

  // App
  FRONTEND_URL: Joi.string().optional(),
});
