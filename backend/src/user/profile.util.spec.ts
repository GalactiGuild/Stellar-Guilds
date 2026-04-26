import { ProfileUtil } from './profile.util';

describe('ProfileUtil.calculateCompleteness', () => {
  it('returns 0 for an empty profile', () => {
    expect(ProfileUtil.calculateCompleteness({})).toBe(0);
  });

  it('returns 25 when only avatar is set', () => {
    expect(
      ProfileUtil.calculateCompleteness({ avatarUrl: 'https://example.com/avatar.png' }),
    ).toBe(25);
  });

  it('returns 25 when only bio is set', () => {
    expect(ProfileUtil.calculateCompleteness({ profileBio: 'Hello world' })).toBe(25);
  });

  it('returns 25 when only display name is set', () => {
    expect(
      ProfileUtil.calculateCompleteness({ firstName: 'Ada', lastName: 'Lovelace' }),
    ).toBe(25);
  });

  it('returns 25 when only tags are set', () => {
    expect(ProfileUtil.calculateCompleteness({ technicalTags: ['Rust'] })).toBe(25);
  });

  it('returns 50 for avatar + bio', () => {
    expect(
      ProfileUtil.calculateCompleteness({
        avatarUrl: 'https://example.com/avatar.png',
        profileBio: 'Builder',
      }),
    ).toBe(50);
  });

  it('returns 75 for avatar + bio + display name', () => {
    expect(
      ProfileUtil.calculateCompleteness({
        avatarUrl: 'https://example.com/avatar.png',
        profileBio: 'Builder',
        firstName: 'Ada',
        lastName: 'Lovelace',
      }),
    ).toBe(75);
  });

  it('returns 100 for a fully complete profile', () => {
    expect(
      ProfileUtil.calculateCompleteness({
        avatarUrl: 'https://example.com/avatar.png',
        profileBio: 'Builder on Stellar',
        firstName: 'Ada',
        lastName: 'Lovelace',
        technicalTags: ['Rust', 'TypeScript'],
      }),
    ).toBe(100);
  });

  it('ignores whitespace-only strings', () => {
    expect(
      ProfileUtil.calculateCompleteness({
        avatarUrl: '   ',
        profileBio: '  ',
        firstName: ' ',
        lastName: ' ',
        technicalTags: [],
      }),
    ).toBe(0);
  });

  it('returns 25 for display name only when lastName is missing', () => {
    expect(
      ProfileUtil.calculateCompleteness({ firstName: 'Ada' }),
    ).toBe(0);
  });
});
