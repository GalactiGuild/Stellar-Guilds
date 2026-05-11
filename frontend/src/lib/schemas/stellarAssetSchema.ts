import { z } from 'zod';

export const stellarIssuerSchema = z
  .string()
  .regex(/^G[A-Z0-9]{55}$/, 'Issuer must start with G and contain 56 uppercase alphanumeric characters');

export const stellarAssetValueSchema = z
  .string()
  .refine(
    (value) => ['XLM', 'USDC', 'EURC'].includes(value) || stellarIssuerSchema.safeParse(value).success,
    'Select XLM, USDC, EURC, or enter a valid 56-character Stellar issuer address'
  );
