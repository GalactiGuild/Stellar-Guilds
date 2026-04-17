import { SetMetadata } from '@nestjs/common';
import { SKIP_MAINTENANCE_KEY } from '../guards/maintenance.guard';

/**
 * Decorator to skip maintenance mode check for specific endpoints.
 *
 * Use this for admin endpoints that should remain accessible during maintenance.
 *
 * @example
 * @SkipMaintenance()
 * @Post('admin/maintenance/toggle')
 * toggleMaintenance() { ... }
 */
export const SkipMaintenance = () => SetMetadata(SKIP_MAINTENANCE_KEY, true);
