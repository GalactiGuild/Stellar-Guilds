export enum PlatformEnum {
  GITHUB = 'github',
  TWITTER = 'twitter',
  X = 'x',
  DISCORD = 'discord',
  UNKNOWN = 'unknown',
}

export class SocialUtil {
  static identifyPlatform(url: string): PlatformEnum {
    try {
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url;
      }
      const hostname = new URL(fullUrl).hostname.toLowerCase();
      const domain = hostname.split('.').slice(-2).join('.');
      switch (domain) {
        case 'github.com':
          return PlatformEnum.GITHUB;
        case 'twitter.com':
          return PlatformEnum.TWITTER;
        case 'x.com':
          return PlatformEnum.X;
        case 'discord.gg':
          return PlatformEnum.DISCORD;
        default:
          return PlatformEnum.UNKNOWN;
      }
    } catch {
      return PlatformEnum.UNKNOWN;
    }
  }
}