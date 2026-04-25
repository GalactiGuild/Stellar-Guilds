import { SocialUtil, PlatformEnum } from '../social.util';

describe('SocialUtil', () => {
  describe('identifyPlatform', () => {
    it('should identify GitHub URLs', () => {
      expect(SocialUtil.identifyPlatform('https://github.com/user')).toBe(PlatformEnum.GITHUB);
      expect(SocialUtil.identifyPlatform('http://github.com/user')).toBe(PlatformEnum.GITHUB);
      expect(SocialUtil.identifyPlatform('github.com/user')).toBe(PlatformEnum.GITHUB);
      expect(SocialUtil.identifyPlatform('www.github.com/user')).toBe(PlatformEnum.GITHUB);
      expect(SocialUtil.identifyPlatform('https://www.github.com/user')).toBe(PlatformEnum.GITHUB);
      expect(SocialUtil.identifyPlatform('api.github.com')).toBe(PlatformEnum.GITHUB);
    });

    it('should identify Twitter URLs', () => {
      expect(SocialUtil.identifyPlatform('https://twitter.com/user')).toBe(PlatformEnum.TWITTER);
      expect(SocialUtil.identifyPlatform('twitter.com/user')).toBe(PlatformEnum.TWITTER);
      expect(SocialUtil.identifyPlatform('www.twitter.com/user')).toBe(PlatformEnum.TWITTER);
    });

    it('should identify X URLs', () => {
      expect(SocialUtil.identifyPlatform('https://x.com/user')).toBe(PlatformEnum.X);
      expect(SocialUtil.identifyPlatform('x.com/user')).toBe(PlatformEnum.X);
      expect(SocialUtil.identifyPlatform('www.x.com/user')).toBe(PlatformEnum.X);
    });

    it('should identify Discord URLs', () => {
      expect(SocialUtil.identifyPlatform('https://discord.gg/invite')).toBe(PlatformEnum.DISCORD);
      expect(SocialUtil.identifyPlatform('discord.gg/invite')).toBe(PlatformEnum.DISCORD);
    });

    it('should return UNKNOWN for unrecognized URLs', () => {
      expect(SocialUtil.identifyPlatform('https://example.com')).toBe(PlatformEnum.UNKNOWN);
      expect(SocialUtil.identifyPlatform('linkedin.com/user')).toBe(PlatformEnum.UNKNOWN);
      expect(SocialUtil.identifyPlatform('invalid-url')).toBe(PlatformEnum.UNKNOWN);
      expect(SocialUtil.identifyPlatform('')).toBe(PlatformEnum.UNKNOWN);
    });

    it('should handle invalid URLs gracefully', () => {
      expect(SocialUtil.identifyPlatform('not-a-url')).toBe(PlatformEnum.UNKNOWN);
      expect(SocialUtil.identifyPlatform('http://')).toBe(PlatformEnum.UNKNOWN);
    });
  });
});