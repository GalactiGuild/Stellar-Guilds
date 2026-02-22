# Social Feature Design

This directory contains the early scaffolding for community and social interaction features.  
The goal is to drive engagement by giving users the ability to follow each other, see a shared activity feed, send messages, and participate in forum discussions.

## Key Components

* `types.ts` – shared TypeScript interfaces (feed items, notifications, messages, threads, posts, follow relationships, privacy settings).
* `mockData.ts` – temporary dummy data for development/testing.
* `components/Feed.tsx` – vertical feed of `FeedItem` records.
* `components/Notifications.tsx` – list view with "mark read" support.
* `components/FollowButton.tsx` – toggle UI for follow/unfollow.

## Application Pages (Next.js)

- `/social/feed` – global community feed.  
- `/social/messages` – direct messaging UX (stubbed chat window and input).  
- `/social/forum` – discussion board listing threads.

Profile pages now embed `ProfileSocialSection` to show a user's feed and follow button.
Settings page has new privacy controls: activity visibility, messaging restrictions, achievement visibility.

## Implementation Notes & Future Work

* **Real‑time updates** – incorporate WebSocket/SignalR/Pusher for real‑time feed and notifications.  Use `useSWR` or subscription hooks.  Prioritize minimal latency.
* **Direct messaging** – messages stored encrypted on server (e.g. by default AES with user key).  Use end‑to‑end encryption library and sync across devices.  Support offline queueing and delivery acknowledgment.
* **Spam/Abuse** – backend should rate‑limit API calls, content scanning, and allow users to block or report.  Moderation tools in forum components will invoke administrative endpoints.
* **Privacy** – conform to `UserPrivacySettings`. Respect `showActivityFeed`, hide profiles when disabled, restrict message sending.
* **Scalability** – design services to horizontally scale; use cursor/pagination for feeds, index notifications per user.
* **Social sharing** – components can expose share buttons using Web Share API or copy-to-clipboard links.
* **Follow system** – many‑to‑many relation; ensure queries are efficient, use caching.
* **Edge cases** – handle deleted accounts, revoked access, cross‑platform message sync, invalid URLs, and offline-first UX.

Refer to social media patterns (Twitter/LinkedIn) and forum architectures (Discourse, Reddit) for UI/UX guidance.

> 💡 This README is a living document and should be expanded as development continues.
