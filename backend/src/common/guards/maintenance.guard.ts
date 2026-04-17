import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../user/dto/user.dto';

export const SKIP_MAINTENANCE_KEY = 'skipMaintenance';

/**
 * Maintenance Guard
 *
 * When API_MAINTENANCE_MODE=true is set, rejects all non-GET requests with 503.
 * Admin users (ADMIN/OWNER) can bypass this guard.
 * Specific IPs and bypass keys can also be configured.
 */
@Injectable()
export class MaintenanceGuard implements CanActivate {
  private readonly logger = new Logger(MaintenanceGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if endpoint is marked to skip maintenance check
    const skipMaintenance = this.reflector.getAllAndOverride<boolean>(
      SKIP_MAINTENANCE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipMaintenance) {
      return true;
    }

    // Check if maintenance mode is enabled
    const maintenanceMode = this.configService.get<string>(
      'API_MAINTENANCE_MODE',
      'false',
    );

    if (maintenanceMode.toLowerCase() !== 'true') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Allow GET requests during maintenance (read-only access)
    if (method === 'GET') {
      return true;
    }

    // Check for admin bypass key
    const bypassKey = this.configService.get<string>('MAINTENANCE_BYPASS_KEY');
    const providedKey = request.headers['x-maintenance-bypass-key'];
    if (bypassKey && providedKey === bypassKey) {
      this.logger.warn(
        `Maintenance bypass via key from IP: ${request.ip}`,
      );
      return true;
    }

    // Check for allowed IPs
    const allowedIps = this.configService.get<string>(
      'MAINTENANCE_ALLOWED_IPS',
      '',
    );
    if (allowedIps) {
      const ips = allowedIps.split(',').map((ip) => ip.trim());
      if (ips.includes(request.ip)) {
        this.logger.warn(
          `Maintenance bypass for allowed IP: ${request.ip}`,
        );
        return true;
      }
    }

    // Check if user is admin (ADMIN or OWNER role)
    const user = request.user;
    if (
      user &&
      (user.role === UserRole.ADMIN || user.role === UserRole.OWNER)
    ) {
      this.logger.warn(
        `Maintenance bypass for admin user: ${user.id || user.email}`,
      );
      return true;
    }

    // Block the request
    this.logger.warn(
      `Maintenance mode blocked ${method} request to ${request.url} from ${request.ip}`,
    );

    const retryAfter = this.configService.get<string>(
      'MAINTENANCE_RETRY_AFTER',
      '3600',
    );

    const maintenanceMessage = this.configService.get<string>(
      'MAINTENANCE_MESSAGE',
      'The API is currently under maintenance. Please try again later.',
    );

    const estimatedDowntime = this.configService.get<string | undefined>(
      'MAINTENANCE_ESTIMATED_DOWNTIME',
      undefined,
    );

    const errorResponse: Record<string, any> = {
      statusCode: 503,
      message: maintenanceMessage,
      error: 'Service Unavailable',
      timestamp: new Date().toISOString(),
    };

    if (estimatedDowntime) {
      errorResponse.estimatedDowntime = estimatedDowntime;
    }

    throw new ServiceUnavailableException(errorResponse);
  }
}
