/**
 * Social platform identification utility
 * Identifies social platforms from URLs for enriching user profiles with icon metadata
 */

export enum PlatformEnum {
  GITHUB = 'github',
  TWITTER = 'twitter',
  DISCORD = 'discord',
  LINKEDIN = 'linkedin',
  YOUTUBE = 'youtube',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TIKTOK = 'tiktok',
  REDDIT = 'reddit',
  TWITCH = 'twitch',
  UNKNOWN = 'unknown',
}

interface PlatformPattern {
  platform: PlatformEnum;
  domainPatterns: RegExp[];
}

const PLATFORM_PATTERNS: PlatformPattern[] = [
  {
    platform: PlatformEnum.GITHUB,
    domainPatterns: [
      /^(?:www\.)?github\.com$/i,
      /^(?:[\w-]+\.)?github\.io$/i,
      /^gist\.github\.com$/i,
    ],
  },
  {
    platform: PlatformEnum.TWITTER,
    domainPatterns: [
      /^(?:www\.)?twitter\.com$/i,
      /^(?:www\.)?x\.com$/i,
      /^mobile\.twitter\.com$/i,
      /^mobile\.x\.com$/i,
    ],
  },
  {
    platform: PlatformEnum.DISCORD,
    domainPatterns: [
      /^(?:www\.)?discord\.gg$/i,
      /^(?:www\.)?discord\.com$/i,
      /^(?:www\.)?discordapp\.com$/i,
    ],
  },
  {
    platform: PlatformEnum.LINKEDIN,
    domainPatterns: [
      /^(?:www\.)?linkedin\.com$/i,
      /^(?:www\.)?lnkd\.in$/i,
    ],
  },
  {
    platform: PlatformEnum.YOUTUBE,
    domainPatterns: [
      /^(?:www\.)?youtube\.com$/i,
      /^(?:www\.)?youtu\.be$/i,
      /^m\.youtube\.com$/i,
    ],
  },
  {
    platform: PlatformEnum.INSTAGRAM,
    domainPatterns: [
      /^(?:www\.)?instagram\.com$/i,
      /^(?:www\.)?instagr\.am$/i,
    ],
  },
  {
    platform: PlatformEnum.FACEBOOK,
    domainPatterns: [
      /^(?:www\.)?facebook\.com$/i,
      /^(?:www\.)?fb\.com$/i,
      /^(?:www\.)?fb\.me$/i,
      /^m\.facebook\.com$/i,
    ],
  },
  {
    platform: PlatformEnum.TIKTOK,
    domainPatterns: [
      /^(?:www\.)?tiktok\.com$/i,
      /^(?:www\.)?vm\.tiktok\.com$/i,
    ],
  },
  {
    platform: PlatformEnum.REDDIT,
    domainPatterns: [
      /^(?:www\.)?reddit\.com$/i,
      /^(?:www\.)?redd\.it$/i,
      /^old\.reddit\.com$/i,
      /^np\.reddit\.com$/i,
    ],
  },
  {
    platform: PlatformEnum.TWITCH,
    domainPatterns: [
      /^(?:www\.)?twitch\.tv$/i,
      /^(?:www\.)?twitch\.tech$/i,
    ],
  },
];

export class SocialUtil {
  /**
   * Identifies the social platform from a given URL
   * @param url - The URL to identify
   * @returns The identified platform enum value
   *
   * @example
   * SocialUtil.identifyPlatform('https://github.com/user') // returns PlatformEnum.GITHUB
   * SocialUtil.identifyPlatform('https://twitter.com/user') // returns PlatformEnum.TWITTER
   * SocialUtil.identifyPlatform('https://x.com/user') // returns PlatformEnum.TWITTER
   * SocialUtil.identifyPlatform('https://discord.gg/invite') // returns PlatformEnum.DISCORD
   * SocialUtil.identifyPlatform('https://unknown.com') // returns PlatformEnum.UNKNOWN
   */
  static identifyPlatform(url: string): PlatformEnum {
    if (!url || typeof url !== 'string') {
      return PlatformEnum.UNKNOWN;
    }

    try {
      // Add protocol if missing for URL parsing
      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//i)) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const parsedUrl = new URL(normalizedUrl);
      const hostname = parsedUrl.hostname.toLowerCase();

      for (const { platform, domainPatterns } of PLATFORM_PATTERNS) {
        for (const pattern of domainPatterns) {
          if (pattern.test(hostname)) {
            return platform;
          }
        }
      }

      return PlatformEnum.UNKNOWN;
    } catch {
      // Invalid URL
      return PlatformEnum.UNKNOWN;
    }
  }

  /**
   * Extracts the handle/username from a social media URL
   * @param url - The social media URL
   * @returns The extracted handle or null if not found
   *
   * @example
   * SocialUtil.extractHandle('https://github.com/octocat') // returns 'octocat'
   * SocialUtil.extractHandle('https://twitter.com/user') // returns 'user'
   */
  static extractHandle(url: string): string | null {
    if (!url || typeof url !== 'string') {
      return null;
    }

    try {
      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//i)) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const parsedUrl = new URL(normalizedUrl);
      const pathname = parsedUrl.pathname;
      const platform = this.identifyPlatform(url);

      // Remove leading/trailing slashes and get path segments
      const segments = pathname.replace(/^\/+|\/+$/g, '').split('/');

      // Platform-specific handle extraction
      switch (platform) {
        case PlatformEnum.LINKEDIN:
          // LinkedIn URLs: linkedin.com/in/username
          if (segments.length >= 2 && segments[0] === 'in') {
            return segments[1];
          }
          break;
        case PlatformEnum.REDDIT:
          // Reddit URLs: reddit.com/u/username or reddit.com/user/username
          if (
            segments.length >= 2 &&
            (segments[0] === 'u' || segments[0] === 'user')
          ) {
            return segments[1];
          }
          break;
        case PlatformEnum.YOUTUBE:
          // YouTube URLs: youtube.com/@username or youtube.com/c/username
          if (segments.length >= 1) {
            if (segments[0].startsWith('@')) {
              return segments[0].substring(1);
            }
            if (
              segments.length >= 2 &&
              (segments[0] === 'c' || segments[0] === 'channel')
            ) {
              return segments[1];
            }
          }
          break;
      }

      // Default: get first path segment
      if (segments.length > 0 && segments[0]) {
        // Filter out common non-handle paths
        const nonHandlePaths = [
          'share',
          'intent',
          'hashtag',
          'search',
          'explore',
          'settings',
        ];
        if (!nonHandlePaths.includes(segments[0].toLowerCase())) {
          return segments[0];
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Gets the icon identifier for a platform (for frontend icon mapping)
   * @param platform - The platform enum value
   * @returns The icon identifier string
   */
  static getIconName(platform: PlatformEnum): string {
    const iconMap: Record<PlatformEnum, string> = {
      [PlatformEnum.GITHUB]: 'github',
      [PlatformEnum.TWITTER]: 'twitter',
      [PlatformEnum.DISCORD]: 'discord',
      [PlatformEnum.LINKEDIN]: 'linkedin',
      [PlatformEnum.YOUTUBE]: 'youtube',
      [PlatformEnum.INSTAGRAM]: 'instagram',
      [PlatformEnum.FACEBOOK]: 'facebook',
      [PlatformEnum.TIKTOK]: 'tiktok',
      [PlatformEnum.REDDIT]: 'reddit',
      [PlatformEnum.TWITCH]: 'twitch',
      [PlatformEnum.UNKNOWN]: 'link',
    };

    return iconMap[platform] || 'link';
  }

  /**
   * Enriches a URL with platform metadata
   * @param url - The social media URL
   * @returns Object containing platform, icon name, and extracted handle
   */
  static enrichUrl(url: string): {
    url: string;
    platform: PlatformEnum;
    iconName: string;
    handle: string | null;
  } {
    const platform = this.identifyPlatform(url);
    const iconName = this.getIconName(platform);
    const handle = this.extractHandle(url);

    return {
      url,
      platform,
      iconName,
      handle,
    };
  }
}
