import { FeedItem, Notification, Message, Thread, Post, FollowRelationship } from "./types";

// placeholder arrays, to be replaced with real data from backend
export const mockFeed: FeedItem[] = [
  {
    id: "f1",
    userAddress: "0xabc",
    content: "Completed a bounty!",
    timestamp: "2026-02-22T12:00:00Z",
    type: "activity",
  },
  {
    id: "f2",
    userAddress: "0xdef",
    content: "Earned the \"Top Contributor\" achievement",
    timestamp: "2026-02-21T08:30:00Z",
    type: "achievement",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    userAddress: "0xabc",
    message: "You have a new follower!",
    timestamp: "2026-02-22T12:05:00Z",
    read: false,
  },
];

export const mockMessages: Message[] = [
  {
    id: "m1",
    from: "0xabc",
    to: "0xdef",
    body: "Hey, are you free to collaborate on the new guild?",
    timestamp: "2026-02-22T11:59:00Z",
    encrypted: true,
  },
];

export const mockThreads: Thread[] = [
  {
    id: "t1",
    title: "Discussion about bounty rewards",
    creator: "0xabc",
    posts: [
      {
        id: "p1",
        author: "0xabc",
        content: "What should be the payout for the next bounty?",
        createdAt: "2026-02-20T09:00:00Z",
      },
    ],
    createdAt: "2026-02-20T09:00:00Z",
  },
];

export const mockFollows: FollowRelationship[] = [
  {
    follower: "0xabc",
    following: "0xdef",
    since: "2026-02-01T00:00:00Z",
  },
];
