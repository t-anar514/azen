/**
 * Realtime topic for one mounted notification bell.
 *
 * The navbar renders <NotificationBell /> twice — once in the desktop cluster,
 * once in the mobile one — and CSS, not React, decides which is visible, so
 * both are mounted and both run their subscribe effect. @supabase/ssr's
 * createBrowserClient hands both the same singleton client, and
 * RealtimeClient.channel() returns the *existing* channel when the topic
 * matches. Keying the topic only by user id therefore made the second mount
 * call .on("postgres_changes", …) on an already-subscribed channel, which
 * throws, and made either bell's unmount tear down the other's subscription.
 *
 * The instance id (React useId()) keeps one channel per mount. React 19 emits
 * ids like «r0», so anything outside [A-Za-z0-9_-] is dropped before it goes
 * out over the socket as a phoenix topic.
 */
export function notificationChannelTopic(userId: string, instanceId: string): string {
  const suffix = instanceId.replace(/[^\w-]/g, "")
  return `notifications:${userId}:${suffix}`
}
