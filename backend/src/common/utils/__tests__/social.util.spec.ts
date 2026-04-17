import { SocialUtil, PlatformEnum } from '../social.util';

describe('SocialUtil', () => {
  describe('identifyPlatform', () => {
    describe('GitHub', () => {
      it('should identify github.com', () => {
        expect(SocialUtil.identifyPlatform('https://github.com/user')).toBe(
          PlatformEnum.GITHUB,
        );
      });

      it('should identify www.github.com', () => {
        expect(SocialUtil.identifyPlatform('https://www.github.com/user')).toBe(
          PlatformEnum.GITHUB,
        );
      });

      it('should identify gist.github.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://gist.github.com/user/abc123'),
        ).toBe(PlatformEnum.GITHUB);
      });

      it('should identify github.io subdomains', () => {
        expect(
          SocialUtil.identifyPlatform('https://user.github.io'),
        ).toBe(PlatformEnum.GITHUB);
      });

      it('should identify GitHub URL without protocol', () => {
        expect(SocialUtil.identifyPlatform('github.com/user')).toBe(
          PlatformEnum.GITHUB,
        );
      });
    });

    describe('Twitter/X', () => {
      it('should identify twitter.com', () => {
        expect(SocialUtil.identifyPlatform('https://twitter.com/user')).toBe(
          PlatformEnum.TWITTER,
        );
      });

      it('should identify x.com', () => {
        expect(SocialUtil.identifyPlatform('https://x.com/user')).toBe(
          PlatformEnum.TWITTER,
        );
      });

      it('should identify www.twitter.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://www.twitter.com/user'),
        ).toBe(PlatformEnum.TWITTER);
      });

      it('should identify www.x.com', () => {
        expect(SocialUtil.identifyPlatform('https://www.x.com/user')).toBe(
          PlatformEnum.TWITTER,
        );
      });

      it('should identify mobile.twitter.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://mobile.twitter.com/user'),
        ).toBe(PlatformEnum.TWITTER);
      });

      it('should identify mobile.x.com', () => {
        expect(SocialUtil.identifyPlatform('https://mobile.x.com/user')).toBe(
          PlatformEnum.TWITTER,
        );
      });

      it('should identify Twitter URL without protocol', () => {
        expect(SocialUtil.identifyPlatform('twitter.com/user')).toBe(
          PlatformEnum.TWITTER,
        );
      });
    });

    describe('Discord', () => {
      it('should identify discord.gg', () => {
        expect(SocialUtil.identifyPlatform('https://discord.gg/invite')).toBe(
          PlatformEnum.DISCORD,
        );
      });

      it('should identify www.discord.gg', () => {
        expect(
          SocialUtil.identifyPlatform('https://www.discord.gg/invite'),
        ).toBe(PlatformEnum.DISCORD);
      });

      it('should identify discord.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://discord.com/users/123'),
        ).toBe(PlatformEnum.DISCORD);
      });

      it('should identify discordapp.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://discordapp.com/invite/abc'),
        ).toBe(PlatformEnum.DISCORD);
      });

      it('should identify Discord URL without protocol', () => {
        expect(SocialUtil.identifyPlatform('discord.gg/invite')).toBe(
          PlatformEnum.DISCORD,
        );
      });
    });

    describe('LinkedIn', () => {
      it('should identify linkedin.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://linkedin.com/in/user'),
        ).toBe(PlatformEnum.LINKEDIN);
      });

      it('should identify lnkd.in', () => {
        expect(SocialUtil.identifyPlatform('https://lnkd.in/abc')).toBe(
          PlatformEnum.LINKEDIN,
        );
      });
    });

    describe('YouTube', () => {
      it('should identify youtube.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://youtube.com/@channel'),
        ).toBe(PlatformEnum.YOUTUBE);
      });

      it('should identify youtu.be', () => {
        expect(SocialUtil.identifyPlatform('https://youtu.be/abc123')).toBe(
          PlatformEnum.YOUTUBE,
        );
      });

      it('should identify m.youtube.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://m.youtube.com/watch?v=abc'),
        ).toBe(PlatformEnum.YOUTUBE);
      });
    });

    describe('Instagram', () => {
      it('should identify instagram.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://instagram.com/user'),
        ).toBe(PlatformEnum.INSTAGRAM);
      });

      it('should identify instagr.am', () => {
        expect(SocialUtil.identifyPlatform('https://instagr.am/p/abc')).toBe(
          PlatformEnum.INSTAGRAM,
        );
      });
    });

    describe('Facebook', () => {
      it('should identify facebook.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://facebook.com/user'),
        ).toBe(PlatformEnum.FACEBOOK);
      });

      it('should identify fb.com', () => {
        expect(SocialUtil.identifyPlatform('https://fb.com/user')).toBe(
          PlatformEnum.FACEBOOK,
        );
      });

      it('should identify fb.me', () => {
        expect(SocialUtil.identifyPlatform('https://fb.me/user')).toBe(
          PlatformEnum.FACEBOOK,
        );
      });
    });

    describe('TikTok', () => {
      it('should identify tiktok.com', () => {
        expect(SocialUtil.identifyPlatform('https://tiktok.com/@user')).toBe(
          PlatformEnum.TIKTOK,
        );
      });

      it('should identify vm.tiktok.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://vm.tiktok.com/abc123'),
        ).toBe(PlatformEnum.TIKTOK);
      });
    });

    describe('Reddit', () => {
      it('should identify reddit.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://reddit.com/u/user'),
        ).toBe(PlatformEnum.REDDIT);
      });

      it('should identify redd.it', () => {
        expect(SocialUtil.identifyPlatform('https://redd.it/abc123')).toBe(
          PlatformEnum.REDDIT,
        );
      });

      it('should identify old.reddit.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://old.reddit.com/r/subreddit'),
        ).toBe(PlatformEnum.REDDIT);
      });

      it('should identify np.reddit.com', () => {
        expect(
          SocialUtil.identifyPlatform('https://np.reddit.com/r/subreddit'),
        ).toBe(PlatformEnum.REDDIT);
      });
    });

    describe('Twitch', () => {
      it('should identify twitch.tv', () => {
        expect(SocialUtil.identifyPlatform('https://twitch.tv/channel')).toBe(
          PlatformEnum.TWITCH,
        );
      });
    });

    describe('Unknown platforms', () => {
      it('should return UNKNOWN for unrecognized domains', () => {
        expect(SocialUtil.identifyPlatform('https://unknown.com/user')).toBe(
          PlatformEnum.UNKNOWN,
        );
      });

      it('should return UNKNOWN for invalid URLs', () => {
        expect(SocialUtil.identifyPlatform('not-a-url')).toBe(
          PlatformEnum.UNKNOWN,
        );
      });

      it('should return UNKNOWN for empty string', () => {
        expect(SocialUtil.identifyPlatform('')).toBe(PlatformEnum.UNKNOWN);
      });

      it('should return UNKNOWN for null/undefined', () => {
        expect(SocialUtil.identifyPlatform(null as any)).toBe(
          PlatformEnum.UNKNOWN,
        );
        expect(SocialUtil.identifyPlatform(undefined as any)).toBe(
          PlatformEnum.UNKNOWN,
        );
      });
    });

    describe('Case insensitivity', () => {
      it('should handle uppercase domains', () => {
        expect(SocialUtil.identifyPlatform('https://GITHUB.COM/user')).toBe(
          PlatformEnum.GITHUB,
        );
      });

      it('should handle mixed case domains', () => {
        expect(SocialUtil.identifyPlatform('https://GitHub.Com/user')).toBe(
          PlatformEnum.GITHUB,
        );
      });
    });
  });

  describe('extractHandle', () => {
    it('should extract handle from GitHub URL', () => {
      expect(SocialUtil.extractHandle('https://github.com/octocat')).toBe(
        'octocat',
      );
    });

    it('should extract handle from Twitter URL', () => {
      expect(SocialUtil.extractHandle('https://twitter.com/user')).toBe(
        'user',
      );
    });

    it('should extract handle from Discord invite URL', () => {
      expect(SocialUtil.extractHandle('https://discord.gg/abc123')).toBe(
        'abc123',
      );
    });

    it('should extract handle from LinkedIn URL', () => {
      expect(SocialUtil.extractHandle('https://linkedin.com/in/username')).toBe(
        'username',
      );
    });

    it('should extract handle from Instagram URL', () => {
      expect(SocialUtil.extractHandle('https://instagram.com/user')).toBe(
        'user',
      );
    });

    it('should return null for non-handle paths', () => {
      expect(SocialUtil.extractHandle('https://twitter.com/share')).toBeNull();
      expect(
        SocialUtil.extractHandle('https://twitter.com/hashtag/test'),
      ).toBeNull();
    });

    it('should return null for invalid URLs', () => {
      expect(SocialUtil.extractHandle('not-a-url')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(SocialUtil.extractHandle('')).toBeNull();
    });

    it('should handle URLs without protocol', () => {
      expect(SocialUtil.extractHandle('github.com/octocat')).toBe('octocat');
    });
  });

  describe('getIconName', () => {
    it('should return github icon name', () => {
      expect(SocialUtil.getIconName(PlatformEnum.GITHUB)).toBe('github');
    });

    it('should return twitter icon name', () => {
      expect(SocialUtil.getIconName(PlatformEnum.TWITTER)).toBe('twitter');
    });

    it('should return discord icon name', () => {
      expect(SocialUtil.getIconName(PlatformEnum.DISCORD)).toBe('discord');
    });

    it('should return link icon name for unknown', () => {
      expect(SocialUtil.getIconName(PlatformEnum.UNKNOWN)).toBe('link');
    });
  });

  describe('enrichUrl', () => {
    it('should enrich GitHub URL', () => {
      const result = SocialUtil.enrichUrl('https://github.com/octocat');
      expect(result).toEqual({
        url: 'https://github.com/octocat',
        platform: PlatformEnum.GITHUB,
        iconName: 'github',
        handle: 'octocat',
      });
    });

    it('should enrich Twitter URL', () => {
      const result = SocialUtil.enrichUrl('https://twitter.com/user');
      expect(result).toEqual({
        url: 'https://twitter.com/user',
        platform: PlatformEnum.TWITTER,
        iconName: 'twitter',
        handle: 'user',
      });
    });

    it('should enrich Discord URL', () => {
      const result = SocialUtil.enrichUrl('https://discord.gg/abc123');
      expect(result).toEqual({
        url: 'https://discord.gg/abc123',
        platform: PlatformEnum.DISCORD,
        iconName: 'discord',
        handle: 'abc123',
      });
    });

    it('should enrich unknown URL', () => {
      const result = SocialUtil.enrichUrl('https://example.com/user');
      expect(result).toEqual({
        url: 'https://example.com/user',
        platform: PlatformEnum.UNKNOWN,
        iconName: 'link',
        handle: 'user',
      });
    });
  });
});
