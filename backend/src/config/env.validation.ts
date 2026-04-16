import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().default(3000),

  // Database
  DATABASE_URL: Joi.string().required(),

  // JWT Configuration
  JWT_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION: Joi.number().positive().default(900),
  JWT_REFRESH_EXPIRATION: Joi.number().positive().default(604800),
});
