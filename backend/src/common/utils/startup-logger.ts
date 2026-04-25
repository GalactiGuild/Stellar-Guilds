/**
 * Startup Logger Utility
 * Creates a beautiful, formatted console summary during application bootstrap
 */

export interface ServiceStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'active' | 'inactive' | 'error';
  details?: string;
}

export interface StartupConfig {
  appName: string;
  version: string;
  environment: string;
  port: number | string;
  swaggerEnabled: boolean;
  swaggerPath?: string;
  services: ServiceStatus[];
}

export class StartupLogger {
  private static readonly COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underline: '\x1b[4m',
    bold: '\x1b[1m',
    
    // Foreground colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    
    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
  };

  private static readonly ICONS = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    database: '🗄️',
    redis: '🔴',
    queue: '📨',
    swagger: '📚',
    security: '🔒',
    server: '🚀',
  };

  /**
   * Log a formatted startup summary
   */
  static logStartup(config: StartupConfig): void {
    const boxWidth = 70;
    const border = '═'.repeat(boxWidth);
    
    console.log('\n');
    console.log(this.colorize('╔' + border + '╗', this.COLORS.cyan));
    
    // App Header
    this.logCentered(`${this.ICONS.server} ${config.appName}`, boxWidth, this.COLORS.bright + this.COLORS.cyan);
    this.logCentered(`v${config.version}`, boxWidth, this.COLORS.dim);
    console.log(this.colorize('╠' + border + '╣', this.COLORS.cyan));
    
    // Environment Info
    console.log(this.colorize('║', this.COLORS.cyan) + ' ' + this.colorize('Environment:', this.COLORS.bold));
    this.logInfo('NODE_ENV', config.environment, this.getEnvColor(config.environment));
    this.logInfo('Port', config.port.toString(), this.COLORS.green);
    this.logInfo('Timestamp', new Date().toLocaleString(), this.COLORS.dim);
    
    if (config.swaggerEnabled) {
      console.log('');
      console.log(this.colorize('║', this.COLORS.cyan) + ' ' + this.colorize(`${this.ICONS.swagger} Swagger Documentation:`, this.COLORS.bold));
      this.logInfo('URL', `/docs`, this.COLORS.blue + this.COLORS.underline);
    }
    
    // Services Status
    console.log('');
    console.log(this.colorize('║', this.COLORS.cyan) + ' ' + this.colorize('Service Status:', this.COLORS.bold));
    console.log(this.colorize('║', this.COLORS.cyan) + ' ' + this.colorize('─'.repeat(boxWidth - 2), this.COLORS.dim));
    
    for (const service of config.services) {
      this.logServiceStatus(service);
    }
    
    console.log(this.colorize('║', this.COLORS.cyan) + ' ' + this.colorize('─'.repeat(boxWidth - 2), this.COLORS.dim));
    console.log(this.colorize('╚' + border + '╝', this.COLORS.cyan));
    
    // Success message
    const successMsg = '✨ Application started successfully!';
    console.log(this.colorize('  ' + successMsg, this.COLORS.bold + this.COLORS.green));
    console.log('\n');
  }

  /**
   * Log startup error with details
   */
  static logStartupError(error: Error, context?: string): void {
    const boxWidth = 70;
    const border = '═'.repeat(boxWidth);
    
    console.log('\n');
    console.log(this.colorize('╔' + border + '╗', this.COLORS.red));
    console.log(this.colorize('║', this.COLORS.red) + this.colorize('          ❌ APPLICATION STARTUP FAILED'.padEnd(boxWidth) + '║', this.COLORS.bold + this.COLORS.red));
    console.log(this.colorize('╚' + border + '╝', this.COLORS.red));
    console.log('');
    
    if (context) {
      console.log(this.colorize(`  Context: ${context}`, this.COLORS.yellow));
    }
    console.log(this.colorize(`  Error: ${error.message}`, this.COLORS.red));
    
    if (error.stack) {
      console.log('');
      console.log(this.colorize('  Stack Trace:', this.COLORS.dim));
      console.log(this.colorize(`    ${error.stack.split('\n').slice(1).join('\n    ')}`, this.COLORS.dim));
    }
    
    console.log('\n');
  }

  /**
   * Get color based on environment
   */
  private static getEnvColor(env: string): string {
    switch (env.toLowerCase()) {
      case 'production':
        return this.COLORS.red;
      case 'staging':
        return this.COLORS.yellow;
      case 'development':
        return this.COLORS.green;
      default:
        return this.COLORS.white;
    }
  }

  /**
   * Create a border line
   */
  private static createBorder(width: number): string {
    return '╔' + '═'.repeat(width) + '╗';
  }

  /**
   * Log centered text
   */
  private static logCentered(text: string, width: number, color: string): void {
    const padding = Math.max(0, Math.floor((width - this.stripAnsi(text).length) / 2));
    const paddedText = ' '.repeat(padding) + text;
    console.log(this.colorize('║', color) + this.colorize(paddedText, color) + this.colorize(' ║', color));
  }

  /**
   * Log info line
   */
  private static logInfo(label: string, value: string, valueColor: string): void {
    const padding = 12 - label.length;
    const line = `    ${label}:${' '.repeat(padding)} ${value}`;
    console.log(line.replace(new RegExp(`${this.escapeRegExp(value)}$`), this.colorize(value, valueColor)));
  }

  /**
   * Log service status
   */
  private static logServiceStatus(service: ServiceStatus): void {
    const icon = this.getServiceIcon(service.name, service.status);
    const statusColor = this.getStatusColor(service.status);
    const statusText = service.status.toUpperCase();
    
    let line = `    ${icon} ${service.name}:`;
    const padding = Math.max(1, 20 - service.name.length);
    line += ' '.repeat(padding);
    line += this.colorize(statusText, statusColor);
    
    if (service.details) {
      line += this.colorize(` - ${service.details}`, this.COLORS.dim);
    }
    
    console.log(line);
  }

  /**
   * Get appropriate icon for service
   */
  private static getServiceIcon(name: string, status: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('database') || lowerName.includes('prisma') || lowerName.includes('postgres')) {
      return this.ICONS.database;
    }
    if (lowerName.includes('redis')) {
      return this.ICONS.redis;
    }
    if (lowerName.includes('queue') || lowerName.includes('bull')) {
      return this.ICONS.queue;
    }
    if (lowerName.includes('swagger')) {
      return this.ICONS.swagger;
    }
    if (lowerName.includes('throttler') || lowerName.includes('security')) {
      return this.ICONS.security;
    }
    return this.ICONS.info;
  }

  /**
   * Get color based on status
   */
  private static getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'connected':
      case 'active':
        return this.COLORS.green;
      case 'disconnected':
      case 'inactive':
        return this.COLORS.yellow;
      case 'error':
        return this.COLORS.red;
      default:
        return this.COLORS.white;
    }
  }

  /**
   * Add ANSI color codes to text
   */
  private static colorize(text: string, color: string): string {
    return `${color}${text}${this.COLORS.reset}`;
  }

  /**
   * Strip ANSI codes from string (for length calculation)
   */
  private static stripAnsi(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Escape special regex characters
   */
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
