# Gaido — Product & Design Teardown

Source: gaidoapp.com marketing site (6 viewport captures) + App Store screenshots + one in-app iPad capture.
Analyst read, July 2026. Inferences are labelled as such; everything else is directly observable.

---

## 1. Complete feature list

### Web (gaidoapp.com)

| Area | Feature | Evidence |
|---|---|---|
| Discovery | City search ("Where are you going?") with pill search + inline Search button | Hero |
| Discovery | City index grid with "Ideal for X" personality badges | Available Cities |
| Discovery | Rotating hero carousel (4 slides, dot pagination) | Hero, dots |
| Content | Travel guides — curated eat/drink/explore recs by licensed local guides | Feature card 1 |
| Marketplace | Private tour booking (walking tours, food crawls) | Feature card 2 |
| Marketplace | Virtual itinerary consultation, hourly ($40/hr) | Guide mockup |
| Marketplace | Guide profiles w/ rating, review count, languages, services, hourly bands ($30–100/hr) | Testimonial + App Store shot |
| Planning | Save recommendations to folders ("Barcelona Trip – Day 1/2") | Feature card 3 |
| Planning | Day-by-day itinerary builder | Feature card 3 |
| Planning | Interactive map, **works offline** | Feature card 3 copy |
| Custom | "Create Custom Tour" / "Build My Tour" preference wizard → AI/human-generated numbered itinerary → **Request booking** or **Make Changes** | Custom Tours section |
| Supply | "Apply to be a Guide" recruitment funnel | Guides section |
| Content mktg | Blog — city-tagged, read-time labelled, 7–8 min longform | From the Blog |
| Growth | "Download App" persistent nav CTA + in-card CTA | Nav, feature card 3 |
| Account | Log In / Sign Up; avatar state when authed | Nav (both states captured) |
| Support | Floating chat widget (bottom-right FAB) | All viewports |
| Search | Global search icon in nav | Nav |

### iOS app

| Feature | Evidence |
|---|---|
| City browse with guide-avatar stacks per city ("+1") | App Store shot 1 |
| Category tabs: **Things to do / Places to eat / Nightlife** | App Store shot 2, iPad capture |
| Filters + Sort by controls | Shot 2, iPad |
| Gem detail: photo, category/neighborhood breadcrumb, guide attribution + verbatim quote, "View Guide Profile", hours, price | Shot 3 |
| Map view: clustered pins, colour-coded by category, bottom card sheet, gem count ("32 Hidden Gems") | Shot 4, iPad |
| Guide profile: rating (4.2, 24 ratings), reviews, service packages, per-service Book Now | Shot 5 |
| Bottom tab bar: **Explore / Tours / Tips / Saved** | iPad capture |
| Save/heart on any card | Shots 2–4 |

---

## 2. Information architecture

```
Root
├── Home (marketing + discovery entry)
├── Search → /city/{city-slug}          e.g. /city/mexico-city-mx
├── Cities index → City hub
│     └── Tabs: Things to do · Places to eat · Nightlife
│           └── Gem detail → Guide profile → Book
├── Guides
│     ├── Guide profile → Services → Book Now
│     └── Apply to be a Guide (supply funnel)
├── Custom Tour wizard → Generated itinerary → Request booking
├── Blog → /blog/{post-slug}   (tagged by city)
├── About Gaido
├── Download App
└── Auth (Log In / Sign Up) → Saved folders, Itineraries
```

**Two entity spines carry the whole product:** `City → Gem (place)` and `Guide → Service → Booking`. Everything else — blog, folders, custom tours — is an accessory that routes traffic into one of those two.

**Slug conventions observed:** `gaidoapp.com/city/mexico-city-mx` (city + ISO country suffix), `gaidoapp.com/blog/private-tsukiji-market-tour-sushi-class-local-guide` (long keyword-stuffed slug). Both are SEO-engineered, not incidental.

---

## 3. Navigation hierarchy

**Web nav is deliberately shallow — 2 content links only.**

```
[Logo]   🔍  Blog  About Gaido   (Create Custom Tour)  (⬇ Download App)  (Log In/Sign Up | Avatar)
```

- Left: wordmark, home link.
- Centre: search icon, Blog, About — *content* only.
- Right: three escalating CTAs — outlined "Create Custom Tour" (mid-intent), outlined "Download App" (retention), outlined auth (identity). No solid-fill button in the nav at all; the solid blue is reserved for in-page primary actions ("Search", "Build My Tour", "Request booking").
- Sticky, transparent→white on scroll, thin bottom border.

Notably **absent from nav**: Cities, Guides, Tours. Those are reached only through the hero search or in-page sections — a bet that intent starts with "where am I going," not "what do you offer."

**App nav is a 4-tab bar:** Explore (discovery) · Tours (marketplace) · Tips (content) · Saved (retention). Clean separation of the four jobs.

---

## 4. Onboarding strategy

Gaido runs a **no-signup-wall funnel**. Observations:

1. **Value before identity.** City pages, gem lists, guide profiles and blog are all readable logged-out. Auth is a right-rail afterthought.
2. **Destination-first, not preference-first.** The single onboarding question is "Where are you going?" — one field, zero friction, and it's the same field that segments the user for everything downstream.
3. **Progressive commitment ladder:** browse → save a gem (requires account) → build folder → request custom tour → book a guide. Each rung asks for slightly more.
4. **Personality pre-segmentation via badges.** "Ideal for foodies / history buffs / culture seekers" on city cards lets users self-select a persona without a quiz.
5. **Custom Tour wizard is the real onboarding.** "Share your pace, interests, and group size" — the preference capture happens at high intent, *after* the user already wants something, not at signup.
6. **App install deferred, then pushed hard.** Web does acquisition and SEO; the app is positioned for the trip itself ("works offline when you land").

---

## 5. Retention mechanisms

| Mechanism | How it works | Strength |
|---|---|---|
| **Saved folders** | Gems → named folders → day-by-day itinerary. Creates a personal artefact with sunk cost. | ★★★★★ |
| **Offline map** | The app becomes *necessary* in-destination when roaming is off. Highest-intent moment locked in. | ★★★★★ |
| **Trip-phase relevance** | Pre-trip (plan) → in-trip (map, guide chat) → post-trip (review). Three distinct return reasons. | ★★★★ |
| **Guide relationship** | Named humans with quotes, photos, ratings. Parasocial pull no algorithm can copy. | ★★★★ |
| **Blog / Tips tab** | City-tagged evergreen content = SEO re-entry + in-app browsing habit. | ★★★ |
| **Consultation product** | $40/hr virtual call converts a browser into a client relationship before the trip. | ★★★ |
| **Review loop** | Ratings prompt post-tour, feeding supply-side ranking. | ★★★ |

The weak spot: **retention between trips**. Travel is inherently low-frequency; nothing observed re-engages a user 6 months after a trip except blog email. That's likely their hardest metric.

---

## 6. UX patterns worth stealing

1. **Italic-accent headline.** `Skip the generic` (ink) + `in *Barcelona*` (italic, blue). Same family, two treatments = dynamic headline slot that reads as designed, not templated. City name is variable-injected.
2. **Floating social-proof card over hero imagery.** Guide name, italic role, tenure ("14 years guiding in Tokyo"), big decorative quote glyph, verbatim testimonial, ★★★★★ 5 (77 reviews). Overlaps the photo edge → depth without a shadow-heavy card.
3. **Two-card offset stack** in hero right column with a circular `>` advance button pinned to the corner of the *lower* card. Playful, signals interactivity.
4. **Product mockups as feature illustration.** Every feature card shows a real phone screen, not an icon. Highest-trust way to say "this exists."
5. **Layered floating UI in mockups.** The guide-profile mockup has the "Itinerary Consultation" and "Book a Tour" cards floating *outside* the phone frame — pulls the money moment out of a 40px-wide screenshot. Very effective.
6. **Pastel category badge overlaid on image, top-left**, with dark text. Six-ish tint families (green / lavender / blue / cream) mapped to persona.
7. **Ghost-numeral process row.** `01 02 03` in oversized light grey, headline + one line each. Zero chrome.
8. **Icon-list with tinted rounded-square icon wells**, blue bold title, grey description. Used for "Who are our guides?".
9. **Inline CTA banner** — light blue full-width rounded bar, question left, pill button right. Low-pressure conversion slot between sections.
10. **Text links end in `→`**, always. Consistent affordance language.
11. **Map + bottom sheet** on mobile: pins stay visible, list scrolls in a sheet, tabs above. Standard but well-executed.
12. **Dual-button decision row** in the custom tour card: light-tint secondary ("Make Changes") next to solid primary ("Request booking"). Gives an escape hatch that reduces commitment anxiety.

---

## 7. UI design system

### Colour

| Token | Value (est.) | Use |
|---|---|---|
| Primary / royal blue | `#1D3FBE` – `#1E40AF` | Solid CTAs, active dot, app chrome |
| Link / accent blue | `#2563EB` | Text links, icon-well glyphs, list titles |
| Ink (headings) | `#16233F` – `#1B2A4A` | Headings — navy, never pure black |
| Body grey | `#5A6478` – `#64748B` | Paragraphs |
| Surface | `#FFFFFF` | Cards |
| Tint section bg | `#E8EFFE` – `#EEF3FF` | Alternating band sections |
| Page bg | `#F7F9FC` | Between sections |
| Badge greens | `#E3F5E1` | "culture seekers" |
| Badge lavender | `#EAE6FB` | "history buffs" |
| Badge blue | `#E4EEFB` | "foodies" |
| Chat FAB | `#000000` | Support |

Discipline observed: **one saturated colour**. No orange, no secondary accent. Everything else is tint or neutral. That's why it reads premium.

### Typography

- **Family:** single geometric-humanist sans throughout (Poppins / Gilroy / Sofia Pro class). Wordmark is a separate brush script.
- **Display:** ~64–72px desktop, weight 800, tracking ≈ −0.02em, leading ≈ 1.05. Two lines max.
- **Section H2:** ~40–44px, weight 700–800, leading ≈ 1.15.
- **Card H3:** ~28–30px, weight 700.
- **Body:** 16–18px, weight 400, leading ≈ 1.6, grey.
- **Eyebrow:** 12–13px, uppercase, tracking ≈ 0.12em, grey (`CUSTOM TOURS`, `HOW IT WORKS`, `STORIES SHAPED BY LOCAL KNOWLEDGE`).
- **Meta:** 13–14px (dates, read time).

### Spacing & layout

- Content max-width ≈ **1200–1280px**, centred, ~24px gutters.
- Section vertical rhythm ≈ **96–128px** desktop.
- 3-col grid, ~32px gap. City grid is 4-col, ~24px gap.
- Card padding ≈ 32–40px.
- Nav height ≈ 68–72px.

### Radii & elevation

- Cards: **24px**. Image thumbs: 16–20px. Icon wells: 12px. Buttons: **fully pill**. Badges: pill.
- Shadows: very soft, large-blur, low-opacity — mostly on floating overlay cards only. Grid cards use flat tint separation instead of shadow.

### Component inventory

`StickyNav` · `HeroSplit` · `SearchPill` · `ImageCarousel(dots)` · `FloatingTestimonialCard` · `FeatureCard(mockup + link→)` · `SectionEyebrow` · `SplitFeature(copy + mockup)` · `ProcessRow(ghost numerals)` · `CityCard(badge overlay + flag)` · `ImageMosaic2x2` · `IconList` · `InlineCtaBanner` · `PostCard(tag + read time + date + Read more)` · `ChatFab`

App adds: `TabBar(4)` · `CategoryTabs` · `FilterBar` · `MapClusterView` · `BottomSheetCard` · `GemDetail` · `GuideAttributionQuote` · `ServicePackageCard` · `SaveHeart`

---

## 8. User journey — first open to core action

```
Google search "things to do in Barcelona"
   ↓ (blog post or city page — SEO entry, no homepage)
City hub → category tab → gem cards with guide quotes
   ↓ trust transfer: "Recommended by Alfonso, Licensed Tour Guide"
Guide profile → services → prices
   ↓ two branches
   ├─ Book Now (high intent, instant)
   └─ Create Custom Tour (undecided)
         ↓ preferences: pace / interests / group size
      Generated numbered itinerary + guide match
         ↓ "Make Changes" (iterate) or
      REQUEST BOOKING  ← core action
   ↓
Account created → save gems to folders → Download App
   ↓
In-destination: offline map, itinerary, guide contact
   ↓
Review → feeds guide ranking → supply loop closes
```

Core action = **booking request submitted**. Note it's a *request*, not a checkout — human matching sits in the middle, which trades conversion friction for higher AOV and guide quality control.

---

## 9. Metrics they're likely optimising

**North star:** completed tour bookings (marketplace GMV × take rate).

Supporting, in rough priority:

1. **City page → booking request conversion** — the money funnel.
2. **Custom tour request submission rate** — lowest-friction high-intent capture; the "Make Changes" button exists purely to rescue abandoners.
3. **Organic sessions from blog + city pages** — the slug engineering says SEO is the primary acquisition channel, not paid.
4. **App install rate from web** — nav slot real estate is expensive; they spent it here.
5. **Saved gems per user / folders created** — the leading indicator for return-and-book.
6. **Guide applications & guide supply per city** — 12+ cities live; marketplace liquidity is the constraint on expansion.
7. **Guide rating average & review volume** — quality moat.
8. **Consultation bookings** — likely a deliberate low-price ($35–40) trojan horse to create a paid relationship early.

---

## 10. Tech stack inferences

*All inferred from URL structure, rendering and asset patterns — not verified.*

- **Next.js (App Router) on Vercel.** Route shape `/city/[slug]`, `/blog/[slug]`, server-rendered content with clean semantic markup and prefetch-on-hover behaviour (status bar shows "Open … in a new tab").
- **Headless CMS or MDX for blog.** Read-time is computed and stored/derived; posts carry a single city tag. Sanity/Contentful-class, or MDX with frontmatter.
- **Postgres-backed marketplace** — cities, guides, services, gems, bookings, reviews. `mexico-city-mx` slug pattern implies a `slug` column with country suffix for collision handling.
- **Mobile: React Native / Expo** (probable). Typography, spacing and component language are near-identical between web and app, and the map is a native map surface (Apple Maps style on the iPad capture) via a RN map binding. A fully native Swift build with this much design parity would be unusual for a team this size.
- **Chat: Intercom or Crisp** — black circular FAB, bottom-right, persistent.
- **Images: CDN-optimised** (Cloudinary/Imgix/Next Image) — consistent aspect-ratio crops across grids.
- **Auth: hosted provider** (Supabase/Clerk/Auth0 class) given the avatar-state nav swap.
- **Analytics: product analytics + SEO tooling** — the funnel design implies event instrumentation on save/request/book.
