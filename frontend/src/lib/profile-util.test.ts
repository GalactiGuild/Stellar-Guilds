import { ProfileUtil } from './profile-util';

describe('ProfileUtil.calculateCompleteness', () => {
  it('returns 0 for an empty profile', () => {
    expect(ProfileUtil.calculateCompleteness({})).toBe(0);
  });

  it('returns 25 for avatar only', () => {
    expect(ProfileUtil.calculateCompleteness({ avatarUrl: 'https://example.com/avatar.png' })).toBe(25);
  });

  it('returns 50 for avatar + bio', () => {
    expect(ProfileUtil.calculateCompleteness({ avatarUrl: 'https://example.com/a.png', bio: 'Hello' })).toBe(50);
  });

  it('returns 75 for avatar + bio + displayName', () => {
    expect(ProfileUtil.calculateCompleteness({ avatarUrl: 'https://example.com/a.png', bio: 'Hello', displayName: 'Alice' })).toBe(75);
  });

  it('returns 100 for a fully complete profile', () => {
    expect(ProfileUtil.calculateCompleteness({
      avatarUrl: 'https://example.com/a.png',
      bio: 'Hello',
      displayName: 'Alice',
      tags: ['rust', 'stellar'],
    })).toBe(100);
  });

  it('ignores whitespace-only fields', () => {
    expect(ProfileUtil.calculateCompleteness({ avatarUrl: '   ', bio: '', displayName: null })).toBe(0);
  });

  it('returns 25 for tags only', () => {
    expect(ProfileUtil.calculateCompleteness({ tags: ['dev'] })).toBe(25);
  });
});
