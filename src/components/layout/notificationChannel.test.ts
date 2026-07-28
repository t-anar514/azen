import { describe, it, expect } from "vitest"

import { notificationChannelTopic } from "./notificationChannel"

/**
 * Minimal stand-in for the two supabase-js behaviours that together caused
 * "cannot add `postgres_changes` callbacks for realtime:notifications:… after
 * `subscribe()`". Both are copied from @supabase/realtime-js 2.108.2:
 *
 *  - RealtimeClient.channel() returns the EXISTING channel when a channel with
 *    the same topic is already registered (RealtimeClient.js:343-355), and
 *  - RealtimeChannel.on() throws for postgres_changes once the channel is
 *    joining or joined (RealtimeChannel.js:404-411).
 *
 * @supabase/ssr's createBrowserClient hands every component the same singleton
 * client, so two <NotificationBell /> mounts share one channel registry.
 */
class FakeChannel {
  joined = false
  bindings = 0
  constructor(readonly topic: string) {}

  on(type: string) {
    if (this.joined && type === "postgres_changes") {
      throw new Error(
        `cannot add \`${type}\` callbacks for ${this.topic} after \`subscribe()\`.`
      )
    }
    this.bindings++
    return this
  }

  subscribe() {
    this.joined = true
    return this
  }
}

class FakeClient {
  channels: FakeChannel[] = []

  channel(topic: string) {
    const realtimeTopic = `realtime:${topic}`
    const exists = this.channels.find((c) => c.topic === realtimeTopic)
    if (exists) return exists
    const chan = new FakeChannel(realtimeTopic)
    this.channels.push(chan)
    return chan
  }

  removeChannel(chan: FakeChannel) {
    this.channels = this.channels.filter((c) => c !== chan)
  }
}

/** What the bell's realtime effect does on mount. */
function mountBell(client: FakeClient, userId: string, instanceId: string) {
  const channel = client.channel(notificationChannelTopic(userId, instanceId))
  channel.on("postgres_changes")
  channel.subscribe()
  return channel
}

const USER = "4899b83f-e3c8-486a-957a-d4cc5165b81c"

describe("notificationChannelTopic", () => {
  it("keeps the user id in the topic", () => {
    expect(notificationChannelTopic(USER, "«r0»")).toContain(USER)
  })

  it("gives concurrently mounted bells distinct topics", () => {
    expect(notificationChannelTopic(USER, "«r0»")).not.toBe(
      notificationChannelTopic(USER, "«r1»")
    )
  })

  it("strips characters React 19 useId() emits that don't belong in a topic", () => {
    // React 19 returns ids like «r0»; the topic travels over the socket as a
    // phoenix topic string, so keep it to plain ASCII.
    expect(notificationChannelTopic(USER, "«r0»")).toMatch(/^notifications:[\w:-]+$/)
  })
})

describe("two mounted bells (navbar renders one for desktop, one for mobile)", () => {
  it("both bind postgres_changes without throwing", () => {
    const client = new FakeClient()
    mountBell(client, USER, "«r0»")

    // This is the reported crash: before the fix both mounts resolved to the
    // same topic, so the second one called .on() on an already-subscribed
    // channel.
    expect(() => mountBell(client, USER, "«r1»")).not.toThrow()
    expect(client.channels).toHaveLength(2)
    expect(client.channels.every((c) => c.bindings === 1)).toBe(true)
  })

  it("unmounting one bell leaves the other one subscribed", () => {
    const client = new FakeClient()
    const desktop = mountBell(client, USER, "«r0»")
    const mobile = mountBell(client, USER, "«r1»")

    client.removeChannel(desktop)

    expect(client.channels).toEqual([mobile])
    expect(mobile.joined).toBe(true)
  })
})
