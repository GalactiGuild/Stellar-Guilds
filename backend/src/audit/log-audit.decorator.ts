import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit_action';

/**
 * Decorator to mark a controller method for audit logging.
 * Usage: @LogAudit('BOUNTY_DELETE') or @LogAudit('USER_BAN')
 */
export const LogAudit = (action: string) => SetMetadata(AUDIT_ACTION_KEY, action);
