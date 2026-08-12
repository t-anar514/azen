# Featured Itinerary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage banner "Намрийн 14 хоног аялал" open a complete, correctly-dated, correctly-priced 14-day autumn itinerary in the planner.

**Architecture:** `golden-route` in `src/data/templates.ts` becomes the single source of truth for the trip — the banner reads its `duration` and `basePrice` instead of hardcoding them, and its CTA passes `?template=golden-route`. Template items carry a relative `dayOffset` instead of an absolute `date`; the planner materialises real dates against a start date anchored to the next 15 October.

**Tech Stack:** Next.js 16 (App Router), TypeScript, next-intl (single locale `mn`), date-fns, vitest.

## Global Constraints

- Single locale: `mn`. All user-facing itinerary content is written in Mongolian directly in `templates.ts`. Do not add `en` strings or new `mn.json` keys for activity content.
- `golden-route` activity costs MUST sum to exactly `285000`. This is enforced by a test.
- `golden-route` MUST have at least one activity for every `dayOffset` 0 through 13.
- Every `type` value must be a member of the existing `ActivityType` union in `src/components/planner/Timeline.tsx`. Do not add new members.
- Use date-fns (`addDays`, `format`) for all date math. Never use `toISOString().split('T')[0]` — it resolves in UTC and shifts the date for users in Mongolia (+08:00) and Japan (+09:00).
- Tests colocate next to source as `*.test.ts`, matching the existing convention (`src/lib/guides/slug.test.ts` etc.). Run with `npm test`.
- Do not reprice or rewrite `tokyo-deep-dive`, `kyoto-zen`, or `classic-japan-14`. They receive only the mechanical `date` → `dayOffset` conversion.

---

### Task 1: Date helpers

**Files:**
- Create: `src/lib/planner/templateDates.ts`
- Test: `src/lib/planner/templateDates.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `nextAutumnStart(today: Date): Date`
  - `toIsoDate(d: Date): string`
  - `materializeTemplateDates<T extends { dayOffset: number }>(activities: T[], start: Date): Array<Omit<T, "dayOffset"> & { date: string }>`

- [ ] **Step 1: Write the failing test**

Create `src/lib/planner/templateDates.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { nextAutumnStart, toIsoDate, materializeTemplateDates } from "./templateDates"

describe("nextAutumnStart", () => {
  it("returns 15 October of the same year when today is before it", () => {
    expect(toIsoDate(nextAutumnStart(new Date(2026, 7, 12)))).toBe("2026-10-15")
  })

  it("rolls to the next year on 15 October itself", () => {
    expect(toIsoDate(nextAutumnStart(new Date(2026, 9, 15)))).toBe("2027-10-15")
  })

  it("rolls to the next year after 15 October", () => {
    expect(toIsoDate(nextAutumnStart(new Date(2026, 11, 1)))).toBe("2027-10-15")
  })
})

describe("toIsoDate", () => {
  it("formats in local time, not UTC", () => {
    // 1 Jan 2026 at 08:00 local. A UTC-based formatter would report
    // 2025-12-31 for anyone east of Greenwich.
    expect(toIsoDate(new Date(2026, 0, 1, 8, 0))).toBe("2026-01-01")
  })
})

describe("materializeTemplateDates", () => {
  it("converts dayOffset into dates counted from the start", () => {
    const result = materializeTemplateDates(
      [
        { id: "a", dayOffset: 0 },
        { id: "b", dayOffset: 3 },
      ],
      new Date(2026, 9, 15)
    )
    expect(result).toEqual([
      { id: "a", date: "2026-10-15" },
      { id: "b", date: "2026-10-18" },
    ])
  })

  it("drops the dayOffset field from the output", () => {
    const [first] = materializeTemplateDates([{ id: "a", dayOffset: 0 }], new Date(2026, 9, 15))
    expect(first).not.toHaveProperty("dayOffset")
  })

  it("crosses a month boundary correctly", () => {
    const [item] = materializeTemplateDates([{ id: "a", dayOffset: 20 }], new Date(2026, 9, 15))
    expect(item.date).toBe("2026-11-04")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- templateDates`
Expected: FAIL — `Failed to resolve import "./templateDates"`

- [ ] **Step 3: Write the implementation**

Create `src/lib/planner/templateDates.ts`:

```ts
import { addDays, format } from "date-fns"

/** The month/day a trip named "Намрийн" anchors to. 15 October. */
const AUTUMN_MONTH = 9 // zero-based: October
const AUTUMN_DAY = 15

/**
 * Formats as YYYY-MM-DD in *local* time. `toISOString()` would resolve in UTC
 * and report the previous day for anyone east of Greenwich, which is every
 * user of this site.
 */
export function toIsoDate(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

/**
 * The start date for the autumn template: 15 October of this year, or of next
 * year if that date has already arrived. Keeps a trip named "autumn" actually
 * in autumn no matter when the visitor clicks.
 */
export function nextAutumnStart(today: Date): Date {
  const thisYear = new Date(today.getFullYear(), AUTUMN_MONTH, AUTUMN_DAY)
  if (today < thisYear) return thisYear
  return new Date(today.getFullYear() + 1, AUTUMN_MONTH, AUTUMN_DAY)
}

/**
 * Turns a template's relative `dayOffset` into a concrete `date`, counted from
 * `start`. Templates store offsets rather than dates so they can never go
 * stale, and so item dates always agree with the trip's own start date.
 */
export function materializeTemplateDates<T extends { dayOffset: number }>(
  activities: T[],
  start: Date
): Array<Omit<T, "dayOffset"> & { date: string }> {
  return activities.map((activity) => {
    const { dayOffset, ...rest } = activity
    return { ...rest, date: toIsoDate(addDays(start, dayOffset)) }
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- templateDates`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/planner/templateDates.ts src/lib/planner/templateDates.test.ts
git commit -m "feat(planner): relative template date helpers anchored to autumn"
```

---

### Task 2: Migrate the template type to dayOffset

**Files:**
- Modify: `src/data/templates.ts:1-9` (types), and the `date` field of every activity in `tokyo-deep-dive`, `kyoto-zen`, `classic-japan-14`
- Test: `src/data/templates.test.ts`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `TemplateActivity` type; `SampleItinerary.activities: TemplateActivity[]`.

Note: `golden-route` is rewritten wholesale in Task 3. In this task, convert its existing 7 items mechanically (`2025-05-01`→0, `-05-02`→1, `-05-04`→3, `-05-06`→5, `-05-07`→6, `-05-10`→9, `-05-12`→11) so the file compiles and tests run.

- [ ] **Step 1: Write the failing test**

Create `src/data/templates.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { SAMPLE_ITINERARIES } from "./templates"

describe("every template", () => {
  it.each(SAMPLE_ITINERARIES.map((t) => [t.id, t] as const))(
    "%s keeps every dayOffset inside its duration",
    (_id, template) => {
      for (const activity of template.activities) {
        expect(activity.dayOffset).toBeGreaterThanOrEqual(0)
        expect(activity.dayOffset).toBeLessThanOrEqual(template.duration - 1)
      }
    }
  )

  it.each(SAMPLE_ITINERARIES.map((t) => [t.id, t] as const))(
    "%s has unique activity ids",
    (_id, template) => {
      const ids = template.activities.map((a) => a.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  )

  it("has globally unique template ids", () => {
    const ids = SAMPLE_ITINERARIES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- templates`
Expected: FAIL — `dayOffset` is `undefined`, so `expect(undefined).toBeGreaterThanOrEqual(0)` fails.

- [ ] **Step 3: Change the type**

Replace `src/data/templates.ts:1-9` with:

```ts
import { ItemType } from "@/components/planner/Timeline";

/**
 * A template activity stores a relative day index rather than a calendar date,
 * so templates never expire and item dates always agree with whatever start
 * date the planner applies. See `src/lib/planner/templateDates.ts`.
 */
export type TemplateActivity = Omit<ItemType, "date"> & {
  /** 0 = arrival day. Must stay below the template's `duration`. */
  dayOffset: number;
};

export interface SampleItinerary {
  id: string;
  duration: number; // Days
  heroImage: string;
  basePrice: number;
  activities: TemplateActivity[];
}
```

- [ ] **Step 4: Convert the existing activities**

In each of the four templates, replace every `date: "YYYY-MM-DD"` with the corresponding `dayOffset`:

- `golden-route`: `gr-1`→0, `gr-2`→1, `gr-3`→3, `gr-4`→5, `gr-5`→6, `gr-6`→9, `gr-7`→11
- `tokyo-deep-dive`: `tdd-1`→0, `tdd-2`→1, `tdd-3`→2, `tdd-4`→4
- `kyoto-zen`: `kz-1`→0, `kz-2`→1, `kz-3`→2, `kz-4`→4
- `classic-japan-14`: `cj-1`→0, `cj-2`→1, `cj-3`→2, `cj-4`→3, `cj-5`→4, `cj-6`→5, `cj-7`→6, `cj-8`→7, `cj-9`→8, `cj-10`→9, `cj-11`→10, `cj-12`→11, `cj-13`→12, `cj-14`→13

- [ ] **Step 5: Run test and typecheck**

Run: `npm test -- templates`
Expected: PASS

Run: `npx tsc --noEmit`
Expected: one error in `src/app/[locale]/planner/page.tsx` — `TemplateActivity[]` is not assignable to `ItemType[]`. This is expected and fixed in Task 4.

- [ ] **Step 6: Commit**

```bash
git add src/data/templates.ts src/data/templates.test.ts
git commit -m "refactor(templates): store relative dayOffset instead of absolute dates"
```

---

### Task 3: Author the 14-day autumn itinerary

**Files:**
- Modify: `src/data/templates.ts` — replace the whole `golden-route` entry
- Modify: `src/data/templates.test.ts` — add golden-route-specific tests

**Interfaces:**
- Consumes: `TemplateActivity` from Task 2.
- Produces: `golden-route` with `basePrice: 285000` and 64 activities across `dayOffset` 0–13.

- [ ] **Step 1: Write the failing tests**

Append to `src/data/templates.test.ts`:

```ts
describe("golden-route (the homepage featured itinerary)", () => {
  const template = SAMPLE_ITINERARIES.find((t) => t.id === "golden-route")!

  it("exists", () => {
    expect(template).toBeDefined()
  })

  it("runs for 14 days", () => {
    expect(template.duration).toBe(14)
  })

  it("costs exactly the advertised basePrice", () => {
    const sum = template.activities.reduce((total, a) => total + a.cost, 0)
    expect(sum).toBe(template.basePrice)
  })

  it("advertises 285,000 yen", () => {
    expect(template.basePrice).toBe(285000)
  })

  it("has at least one activity on every day", () => {
    const covered = new Set(template.activities.map((a) => a.dayOffset))
    const missing = Array.from({ length: template.duration }, (_, i) => i).filter(
      (day) => !covered.has(day)
    )
    expect(missing).toEqual([])
  })

  it("gives every activity coordinates so the map renders", () => {
    for (const activity of template.activities) {
      expect(activity.lat).toBeTypeOf("number")
      expect(activity.lng).toBeTypeOf("number")
    }
  })

  it("gives every activity a note", () => {
    for (const activity of template.activities) {
      expect(activity.notes?.length ?? 0).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- templates`
Expected: FAIL — cost sum is 32000, not 285000; days 2, 4, 7, 8, 10, 12, 13 uncovered; no notes.

- [ ] **Step 3: Replace the golden-route entry**

Replace the entire `golden-route` object in `src/data/templates.ts` with:

```ts
  {
    id: "golden-route",
    duration: 14,
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200",
    basePrice: 285000,
    activities: [
      // Өдөр 1 — Токио руу ирэх
      { id: "gr-1", title: "Наритад газардах", dayOffset: 0, type: "flight", location: "Нарита олон улсын нисэх буудал", cost: 0, lat: 35.7720, lng: 140.3929, notes: "Visit Japan Web-д урьдчилан бүртгүүлбэл гаалийн дараалал богиносно. QR кодоо утсандаа хадгалаарай." },
      { id: "gr-2", title: "JR Pass идэвхжүүлэх", dayOffset: 0, type: "ticket", location: "Нарита JR төв", cost: 80000, lat: 35.7720, lng: 140.3929, notes: "14 хоногийн энгийн JR Pass. Идэвхжүүлсэн өдрөөс тоологдоно, тиймээс ирсэн өдрөө нээх нь хамгийн ашигтай." },
      { id: "gr-3", title: "Narita Express-ээр хот руу", dayOffset: 0, type: "train", location: "Токио станц", cost: 0, lat: 35.6812, lng: 139.7671, notes: "JR Pass-д багтана. 60 орчим минут. Суудал захиалах шаардлагатай ч төлбөргүй." },
      { id: "gr-4", title: "Токио дахь буудал (4 шөнө)", dayOffset: 0, type: "hotel", location: "Асакүса", cost: 36000, lat: 35.7145, lng: 139.7925, notes: "4 шөнийн нийт үнэ. Асакүса нь Гинза, Асакүса метроны шугамд ойр, төвөөс хямд." },
      { id: "gr-5", title: "Өдөр тутмын хоол ба конбини", dayOffset: 0, type: "food", location: "Япон даяар", cost: 12000, lat: 35.6812, lng: 139.7671, notes: "14 хоногийн өглөөний цай, үдийн хоол, ундааны ойролцоо зардал. 7-Eleven, Lawson, FamilyMart хямд бөгөөд чанартай." },

      // Өдөр 2 — Баруун Токио
      { id: "gr-6", title: "Мэйжи сүм ба Ёёоги цэцэрлэг", dayOffset: 1, type: "culture", location: "Мэйжи Жингү", cost: 0, lat: 35.6764, lng: 139.6993, notes: "Нар мандахаас нээлттэй. Өглөө эрт очвол бараг хүнгүй. Модны навчис 11-р сард шарладаг." },
      { id: "gr-7", title: "Харажүкү Такэшита гудамж", dayOffset: 1, type: "shopping", location: "Харажүкү", cost: 0, lat: 35.6702, lng: 139.7027, notes: "Амралтын өдөр маш их хүнтэй. Крепе амтлаарай." },
      { id: "gr-8", title: "Шибүяа уулзвар ба Хачико", dayOffset: 1, type: "spot", location: "Шибүяа уулзвар", cost: 0, lat: 35.6595, lng: 139.7004, notes: "Дээрээс харах бол Shibuya Sky-гийн тасалбарыг онлайнаар урьдчилан ав — нар жаргах цаг хамгийн эрт дуусдаг." },
      { id: "gr-9", title: "Ичиран рамен", dayOffset: 1, type: "food", location: "Шибүяа", cost: 1200, lat: 35.6612, lng: 139.7010, notes: "Тус бүр тусгаарлагдсан ширээтэй. Автоматаас тасалбар аваад маягт дээрээ хүслээ тэмдэглэнэ." },
      { id: "gr-10", title: "Шинжүкү Омоидэ Ёкочо оройн хоол", dayOffset: 1, type: "meal", location: "Омоидэ Ёкочо", cost: 3500, lat: 35.6938, lng: 139.6994, notes: "Жижиг якитори газрууд. Бэлэн мөнгө авч яв — зарим нь карт авахгүй." },
      { id: "gr-11", title: "Suica карт цэнэглэх", dayOffset: 1, type: "transport", location: "Токио", cost: 5000, lat: 35.6812, lng: 139.7671, notes: "JR Pass метронд хамаарахгүй тул Suica/Pasmo зайлшгүй хэрэгтэй. 14 хоногийн ойролцоо дүн." },

      // Өдөр 3 — Зүүн Токио
      { id: "gr-12", title: "Сэнсо-жи сүм ба Накамисэ", dayOffset: 2, type: "culture", location: "Сэнсо-жи", cost: 0, lat: 35.7148, lng: 139.7967, notes: "Сүмийн талбай 24 цаг нээлттэй. 8:00-аас өмнө очвол Накамисэ гудамж хоосон, зураг сайхан гарна." },
      { id: "gr-13", title: "Токио Скайтри ажиглалтын тавцан", dayOffset: 2, type: "landmark", location: "Токио Скайтри", cost: 2700, lat: 35.7101, lng: 139.8107, notes: "Тэнгэр цэлмэг өдөр Фүжи уул харагдана. Онлайн тасалбар хямд бөгөөд дараалалгүй." },
      { id: "gr-14", title: "Цүкижи гадна зах", dayOffset: 2, type: "food", location: "Цүкижи", cost: 2500, lat: 35.6654, lng: 139.7707, notes: "9:00-11:00 цагт хамгийн идэвхтэй. Ням, Даваа гарагт олон дэлгүүр хаалттай." },
      { id: "gr-15", title: "teamLab Planets", dayOffset: 2, type: "activity", location: "Тоёосү", cost: 3900, lat: 35.6486, lng: 139.7906, notes: "Хөл нүцгэн ордог, өвдөг хүртэл ус руу ордог тул шуумгалж болох өмд өмс. Тасалбар заавал урьдчилан." },

      // Өдөр 4 — Камакүра
      { id: "gr-16", title: "Камакүра руу галт тэрэг", dayOffset: 3, type: "train", location: "Камакүра станц", cost: 0, lat: 35.3192, lng: 139.5468, notes: "JR Yokosuka шугам, JR Pass-д багтана. Токио станцаас 1 цаг." },
      { id: "gr-17", title: "Камакүрагийн Их Будда", dayOffset: 3, type: "landmark", location: "Котокү-ин", cost: 300, lat: 35.3168, lng: 139.5357, notes: "Хөшөөний дотор орох бол нэмэлт 50 иен. 17:00 цагт хаана." },
      { id: "gr-18", title: "Хококү-жи хулсан сүм", dayOffset: 3, type: "nature", location: "Хококү-жи", cost: 400, lat: 35.3216, lng: 139.5636, notes: "Хулсан ойд суугаад матча цай уух боломжтой (нэмэлт 600 иен). Арашиямагаас хүн олон дахин цөөн." },
      { id: "gr-19", title: "Эношимад нар жаргах", dayOffset: 3, type: "photo", location: "Эношима", cost: 0, lat: 35.2991, lng: 139.4803, notes: "Цэлмэг өдөр Фүжи уулын дэвсгэр дээр нар жаргана. Энодэн галт тэрэг далайн эрэг дагуу явдаг." },

      // Өдөр 5 — Хаконэ руу
      { id: "gr-20", title: "Хаконэ руу шилжих", dayOffset: 4, type: "train", location: "Одавара станц", cost: 0, lat: 35.2564, lng: 139.1552, notes: "Токиогоос Кодама шинкансэнээр 35 минут, JR Pass-д багтана. Нозоми-д JR Pass хүчингүй." },
      { id: "gr-21", title: "Хаконэ Фрий Пасс авах", dayOffset: 4, type: "ticket", location: "Одавара станц", cost: 6100, lat: 35.2564, lng: 139.1552, notes: "2 хоногийн пасс. Уулын галт тэрэг, дүүжин зам, усан онгоц, автобус бүгд багтана. JR Pass Хаконэд хамаарахгүй." },
      { id: "gr-22", title: "Хаконэ Задгай агаарын музей", dayOffset: 4, type: "culture", location: "Chokoku-no-mori", cost: 2000, lat: 35.2447, lng: 139.0500, notes: "Пикассогийн тусдаа павильонтой. Уулын навчисны өнгө 11-р сарын эхээр хамгийн сайхан." },
      { id: "gr-23", title: "Рёкан дээр буудаллах (2 шөнө)", dayOffset: 4, type: "hotel", location: "Хаконэ-Юмото", cost: 26000, lat: 35.2324, lng: 139.1069, notes: "2 шөнийн нийт үнэ, онсэнтэй рёкан. Шивээстэй бол хувийн онсэн (kashikiri) урьдчилан захиалаарай." },
      { id: "gr-24", title: "Кайсэки оройн хоол", dayOffset: 4, type: "meal", location: "Хаконэ-Юмото", cost: 8000, lat: 35.2324, lng: 139.1069, notes: "Рёканы уламжлалт олон зүйлт хоол, ихэвчлэн 18:00-19:00 цагт. Юкатагаа өмсөөд очно." },

      // Өдөр 6 — Хаконэ
      { id: "gr-25", title: "Оwakudani галт уулын хөндий", dayOffset: 5, type: "nature", location: "Оwakudani", cost: 0, lat: 35.2447, lng: 139.0197, notes: "Фрий Пасст багтана. Хүхрийн уураар чанасан хар өндөг идвэл 7 жил нас нэмнэ гэдэг. Амьсгалын замын өвчтэй бол болгоомжил." },
      { id: "gr-26", title: "Аши нуурын усан онгоц", dayOffset: 5, type: "activity", location: "Аши нуур", cost: 0, lat: 35.2017, lng: 139.0232, notes: "Фрий Пасст багтана. Цэлмэг өдөр Фүжи уул усан дээр тусаж харагдана." },
      { id: "gr-27", title: "Хаконэ жинжагийн усан тори", dayOffset: 5, type: "photo", location: "Хаконэ жинжа", cost: 0, lat: 35.2045, lng: 139.0256, notes: "Усан дээрх улаан тори. Зураг авах дараалал өдөр дунд урт болдог, өглөө эрт оч." },
      { id: "gr-28", title: "Онсэнд орох", dayOffset: 5, type: "activity", location: "Хаконэ", cost: 1500, lat: 35.2324, lng: 139.1069, notes: "Усанд орохын өмнө биеэ бүрэн угаана. Алчуураа усанд хийхгүй. Шивээстэй хүнийг зарим онсэн оруулахгүй." },

      // Өдөр 7 — Киото руу
      { id: "gr-29", title: "Киото руу шинкансэн", dayOffset: 6, type: "train", location: "Киото станц", cost: 0, lat: 34.9858, lng: 135.7588, notes: "Одаварагаас Хикари 2 цаг, JR Pass-д багтана. Фүжи уул баруун талын D/E суудлаас харагдана." },
      { id: "gr-30", title: "Киото дахь буудал (4 шөнө)", dayOffset: 6, type: "hotel", location: "Киото станцын орчим", cost: 34000, lat: 34.9858, lng: 135.7588, notes: "4 шөнийн нийт үнэ. Станцын орчим автобус, галт тэрэгний холболт хамгийн сайн." },
      { id: "gr-31", title: "Хотын автобус ба метроны зардал", dayOffset: 6, type: "transport", location: "Киото", cost: 2400, lat: 34.9858, lng: 135.7588, notes: "Киотод автобус гол тээвэр болдог. ICOCA болон Suica хоёулаа ажиллана." },
      { id: "gr-32", title: "Хигашияма оройн зугаалга", dayOffset: 6, type: "culture", location: "Хигашияма", cost: 0, lat: 34.9948, lng: 135.7850, notes: "Нэнэ-но-мичи, Санэн-зака гудамж орой гэрэлтүүлэгтэй, өдрөөс хамаагүй чимээгүй." },

      // Өдөр 8 — Киото зүүн
      { id: "gr-33", title: "Фүшими Инари мянган тори", dayOffset: 7, type: "culture", location: "Фүшими Инари Тайшя", cost: 0, lat: 34.9671, lng: 135.7727, notes: "24 цаг нээлттэй, тасалбаргүй. 7:00-аас өмнө очвол хүнгүй зураг авна. Оргил хүртэл 2-3 цаг." },
      { id: "gr-34", title: "Фүшимигийн сакэ музей", dayOffset: 7, type: "activity", location: "Гэккэйкан Окура", cost: 400, lat: 34.9315, lng: 135.7614, notes: "Тасалбарт амталгаа багтана. Фүшими бол Японы хамгийн том сакэ үйлдвэрлэлийн бүс." },
      { id: "gr-35", title: "Кийомизү-дэра", dayOffset: 7, type: "culture", location: "Кийомизү-дэра", cost: 500, lat: 34.9949, lng: 135.7850, notes: "Намрын навчисны шөнийн гэрэлтүүлэг 11-р сард тусдаа тасалбартай." },
      { id: "gr-36", title: "Кабуки үзвэр (нэг үзэгдэл)", dayOffset: 7, type: "music", location: "Минами-за театр", cost: 2000, lat: 35.0036, lng: 135.7723, notes: "Нэг үзэгдлийн тасалбар хямд. Англи хэлний чихэвч түрээслэх боломжтой." },
      { id: "gr-37", title: "Гион гэйшагийн хороолол", dayOffset: 7, type: "nightlife", location: "Гион", cost: 0, lat: 35.0037, lng: 135.7750, notes: "Гэйко, майкогийн зургийг зөвшөөрөлгүй авахыг хориглодог бөгөөд торгууль ногдуулдаг." },

      // Өдөр 9 — Киото баруун
      { id: "gr-38", title: "Арашияма хулсан ой", dayOffset: 8, type: "nature", location: "Арашияма хулсан төгөл", cost: 0, lat: 35.0158, lng: 135.6706, notes: "8:00-аас өмнө очвол чимээгүй. Тэнгүү гүүр, сармагчны цэцэрлэг ойрхон." },
      { id: "gr-39", title: "Кинкаку-жи алтан павильон", dayOffset: 8, type: "landmark", location: "Кинкаку-жи", cost: 500, lat: 35.0394, lng: 135.7292, notes: "9:00 цагт нээнэ. Тасалбар нь сахиус хэлбэртэй, дурсгал болгон авч үлддэг." },
      { id: "gr-40", title: "Рёан-жи чулуун цэцэрлэг", dayOffset: 8, type: "culture", location: "Рёан-жи", cost: 600, lat: 35.0345, lng: 135.7182, notes: "15 чулууны 14 нь л аль ч цэгээс нэг зэрэг харагддаг." },
      { id: "gr-41", title: "Чайны ёслолын хичээл", dayOffset: 8, type: "activity", location: "Киото", cost: 4000, lat: 35.0116, lng: 135.7681, notes: "Урьдчилан захиална. Англи хэлтэй хөтөчтэй хувилбар бий, кимоно түрээслэх нэмэлт үйлчилгээтэй." },
      { id: "gr-42", title: "Шожин рёори оройн хоол", dayOffset: 8, type: "meal", location: "Киото", cost: 3500, lat: 34.9948, lng: 135.7850, notes: "Сүмийн уламжлалт ногооны хоол. Вегетариан, веган хүнд тохиромжтой." },

      // Өдөр 10 — Нара
      { id: "gr-43", title: "Нара руу галт тэрэг", dayOffset: 9, type: "train", location: "Нара станц", cost: 0, lat: 34.6851, lng: 135.8048, notes: "JR Нара шугам, Киотогоос 45 минут, JR Pass-д багтана." },
      { id: "gr-44", title: "Нара парк ба буга", dayOffset: 9, type: "nature", location: "Нара парк", cost: 200, lat: 34.6851, lng: 135.8048, notes: "Буганы крекер (шика сэнбэй) 200 иен. Хоол барьвал буга бөхийж мэндчилдэг. Уут, газрын зургаа нуу — буга иддэг." },
      { id: "gr-45", title: "Тодай-жи их Будда", dayOffset: 9, type: "landmark", location: "Тодай-жи", cost: 800, lat: 34.6889, lng: 135.8398, notes: "Дэлхийн хамгийн том модон барилгуудын нэг. 17:00 цагт хаана." },
      { id: "gr-46", title: "Нишики захын амталгаа", dayOffset: 9, type: "food", location: "Нишики зах", cost: 2000, lat: 35.0050, lng: 135.7648, notes: "Киото буцаж ирээд. \"Киотогийн гал зуух\" гэдэг. Явж байхдаа идэхийг хориглосон дэлгүүр цөөнгүй." },

      // Өдөр 11 — Осака руу
      { id: "gr-47", title: "Осака руу шилжих", dayOffset: 10, type: "train", location: "Осака Намба", cost: 0, lat: 34.6670, lng: 135.5004, notes: "JR Киото шугамаар 30 минут, JR Pass-д багтана." },
      { id: "gr-48", title: "Осака дахь буудал (3 шөнө)", dayOffset: 10, type: "hotel", location: "Намба", cost: 14000, lat: 34.6670, lng: 135.5004, notes: "3 шөнийн нийт үнэ. Намба нь Дотонбори болон Кансай нисэх буудлын холболтод ойр." },
      { id: "gr-49", title: "Осака метроны зардал", dayOffset: 10, type: "transport", location: "Осака", cost: 1500, lat: 34.6670, lng: 135.5004, notes: "JR Pass Осака хотын метронд хамаарахгүй." },
      { id: "gr-50", title: "Дотонборийн шөнийн гэрэл", dayOffset: 10, type: "nightlife", location: "Дотонбори", cost: 3000, lat: 34.6687, lng: 135.5013, notes: "Глико гүйгчийн самбар. Такояки, окономияки, кушикацу амтлаарай — кушикацуг хоёр дахин дүрэхийг хориглоно." },

      // Өдөр 12 — Осака
      { id: "gr-51", title: "Осака цайз ба цэцэрлэг", dayOffset: 11, type: "castle", location: "Осака цайз", cost: 1200, lat: 34.6873, lng: 135.5262, notes: "Цайзын хүрээлэн үнэгүй, дотоод музей тасалбартай. Намрын навчис 11-р сард гоё." },
      { id: "gr-52", title: "Күромон зах", dayOffset: 11, type: "market", location: "Күромон Ичиба", cost: 0, lat: 34.6653, lng: 135.5060, notes: "Шинэ далайн хоолыг газар дээр нь шарж өгнө. Өглөө 9-10 цагт хамгийн сонголт сайтай." },
      { id: "gr-53", title: "Үмэда Sky Building", dayOffset: 11, type: "spot", location: "Үмэда", cost: 1500, lat: 34.7052, lng: 135.4899, notes: "Нээлттэй тэнгэрийн цэцэрлэг. Нар жаргах цагаас 30 минутын өмнө очвол хамгийн сайхан." },
      { id: "gr-54", title: "Вагю оройн хоол", dayOffset: 11, type: "meal", location: "Осака", cost: 6000, lat: 34.6687, lng: 135.5013, notes: "Кобэ болон Мацүсака үхрийн мах. Сайн газрууд урьдчилсан захиалгатай." },

      // Өдөр 13 — Хирошима ба Мияжима
      { id: "gr-55", title: "Хирошима руу шинкансэн", dayOffset: 12, type: "train", location: "Хирошима станц", cost: 0, lat: 34.3978, lng: 132.4756, notes: "Санё шинкансэн Хикари 1 цаг 40 минут, JR Pass-д багтана. Өглөө 7-8 цагт гарвал бүх зүйлд амжина." },
      { id: "gr-56", title: "Энх тайвны дурсгалын цэцэрлэг ба музей", dayOffset: 12, type: "landmark", location: "Энх тайвны дурсгалын цэцэрлэг", cost: 200, lat: 34.3955, lng: 132.4536, notes: "Музей 200 иен. Сэтгэл хөдөлгөм, хүнд агуулгатай — 2 цаг гаргаарай." },
      { id: "gr-57", title: "Мияжима руу гатлага онгоц", dayOffset: 12, type: "transport", location: "Мияжимагүчи", cost: 0, lat: 34.3033, lng: 132.3033, notes: "JR-ийн гатлага онгоц JR Pass-д багтана. 10 минут." },
      { id: "gr-58", title: "Ицүкүшима сүм ба усан тори", dayOffset: 12, type: "culture", location: "Ицүкүшима жинжа", cost: 300, lat: 34.2959, lng: 132.3197, notes: "Далайн түрлэгийн цагийг урьдчилан шалга — өндөр түрлэгийн үед тори усан дээр хөвж байгаа мэт харагдана." },
      { id: "gr-59", title: "Миясэн уулын дүүжин зам", dayOffset: 12, type: "nature", location: "Мисэн уул", cost: 2000, lat: 34.2794, lng: 132.3197, notes: "Оргилд зэрлэг сармагчин, буга бий. Сүүлийн буух цагийг заавал шалга, ихэвчлэн 17:00." },
      { id: "gr-60", title: "Мияжимагийн шинэ хясаа", dayOffset: 12, type: "food", location: "Омотэсандо гудамж", cost: 1500, lat: 34.2971, lng: 132.3205, notes: "Шарсан хясаа болон момижи манжү. Ихэнх дэлгүүр 17:00 цагт хаадаг." },
      { id: "gr-61", title: "Хирошима окономияки", dayOffset: 12, type: "meal", location: "Окономимүра", cost: 1800, lat: 34.3927, lng: 132.4596, notes: "Хирошимагийн хэв маяг давхарлаж хийдэг, гоймонтой — Осакагийнхаас өөр." },

      // Өдөр 14 — Буцах
      { id: "gr-62", title: "Бэлэг дурсгал ба нөөц зардал", dayOffset: 13, type: "gift", location: "Шинсайбаши", cost: 10000, lat: 34.6723, lng: 135.5013, notes: "Нөөц зардал. Дон Кихотэ 24 цаг ажилладаг, 5000 иенээс дээш tax-free боломжтой." },
      { id: "gr-63", title: "Кансай нисэх буудал руу", dayOffset: 13, type: "transport", location: "Кансай олон улсын нисэх буудал", cost: 0, lat: 34.4342, lng: 135.2328, notes: "JR Haruka экспресс JR Pass-д багтана, 75 минут. Нислэгээс 3 цагийн өмнө очиж бай." },
      { id: "gr-64", title: "Буцах нислэг", dayOffset: 13, type: "flight", location: "Кансай олон улсын нисэх буудал", cost: 0, lat: 34.4342, lng: 135.2328, notes: "Tax-free худалдан авалтын бичиг баримтаа гаальд үзүүлнэ. Барааг задлаагүй байх шаардлагатай." },
    ]
  },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- templates`
Expected: PASS. If the cost test fails, the sum is wrong — it must be exactly 285000.
Verified breakdown:

| Bucket | Items | Total |
| --- | --- | --- |
| Accommodation | gr-4, gr-23, gr-30, gr-48 | 110,000 |
| Transport & passes | gr-2, gr-11, gr-21, gr-31, gr-49 | 95,000 |
| Entries & activities | the remainder | 26,500 |
| Meals | gr-5, gr-9, gr-10, gr-14, gr-24, gr-42, gr-46, gr-50, gr-54, gr-61 | 43,500 |
| Buffer | gr-62 | 10,000 |
| **Total** | | **285,000** |

- [ ] **Step 5: Commit**

```bash
git add src/data/templates.ts src/data/templates.test.ts
git commit -m "feat(templates): full 14-day autumn itinerary reconciling to Y285,000"
```

---

### Task 4: Apply templates with materialised dates in the planner

**Files:**
- Modify: `src/app/[locale]/planner/page.tsx:118-138`

**Interfaces:**
- Consumes: `nextAutumnStart`, `toIsoDate`, `materializeTemplateDates` from Task 1; `SAMPLE_ITINERARIES` from Task 3.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the import**

At `src/app/[locale]/planner/page.tsx`, alongside the existing imports:

```ts
import { nextAutumnStart, toIsoDate, materializeTemplateDates } from "@/lib/planner/templateDates"
import { addDays } from "date-fns"
```

- [ ] **Step 2: Replace the template branch**

Replace the body of the `if (templateId)` block (currently lines 120-138) with:

```ts
    if (templateId) {
      const template = SAMPLE_ITINERARIES.find(t => t.id === templateId)
      if (template) {
        // Templates carry relative dayOffsets; materialise them against the
        // same start date we write into settings, so the timeline and the
        // trip's own date range can never disagree.
        const start = nextAutumnStart(new Date())
        const materialized = materializeTemplateDates(template.activities, start)

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(materialized)
        setItineraryTitle(t(`item.templates.${templateId}.title`, { fallback: templateId }))
        calculateTotal(materialized)

        // duration counts days inclusive, so the last day is start + (duration - 1).
        setSettings(prev => ({
          ...prev,
          startDate: toIsoDate(start),
          endDate: toIsoDate(addDays(start, template.duration - 1)),
        }))

        if (materialized.length > 0) {
          setNewItemId(materialized[0].id)
        }
        return
      }
    }
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output (the Task 2 error is now resolved).

- [ ] **Step 4: Verify in the browser**

Start the dev server and open `/planner?template=golden-route`. Confirm:
- the title reads "Намрийн 14 Хоног Аялал"
- the first item is "Наритад газардах" dated 15 October
- the last item is dated 28 October
- the cost footer reads ¥285,000

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/planner/page.tsx"
git commit -m "fix(planner): materialise template dates from the trip start date"
```

---

### Task 5: Wire the homepage banner

**Files:**
- Modify: `src/components/home/FeaturedItinerary.tsx`

**Interfaces:**
- Consumes: `SAMPLE_ITINERARIES` from Task 3.
- Produces: nothing.

- [ ] **Step 1: Read the trip from the template**

Add the import and look up the record at the top of `FeaturedItinerary.tsx`:

```ts
import { SAMPLE_ITINERARIES } from "@/data/templates"

const FEATURED_ID = "golden-route"
```

Inside the component, before the return:

```ts
  const trip = SAMPLE_ITINERARIES.find((t) => t.id === FEATURED_ID)
  if (!trip) return null
```

- [ ] **Step 2: Replace the three hardcoded values**

Badge — replace `✦ Онцлох хөтөлбөр · 14 хоног` with:

```tsx
            ✦ Онцлох хөтөлбөр · {trip.duration} хоног
```

CTA — replace `href="/planner"` with:

```tsx
              href={{ pathname: "/planner", query: { template: FEATURED_ID } } as any}
```

Price — replace `¥285,000` with:

```tsx
              <div className="font-display text-2xl font-extrabold">
                ¥{trip.basePrice.toLocaleString()}
              </div>
```

Note: the `as any` on the href matches the existing pattern in
`src/components/home/SampleItineraries.tsx:27` — next-intl's typed `pathnames`
does not model query params.

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Verify end to end**

On the homepage, confirm the banner still reads "14 хоног" and "¥285,000", then click
"Төлөвлөгчид нэмэх". Confirm it lands on `/planner?template=golden-route` with the
full 14-day itinerary and a ¥285,000 footer.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/FeaturedItinerary.tsx
git commit -m "fix(home): featured banner opens its own itinerary in the planner"
```

---

### Task 6: Full verification

- [ ] **Step 1: Run the whole suite**

Run: `npm test`
Expected: all tests pass, including the pre-existing payments/guides/drivers suites.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build completes with no type or lint errors.

- [ ] **Step 3: Commit any remaining changes**

```bash
git status
```

Expected: clean, apart from the pre-existing unstaged `next.config.ts` and
`supabase/seeds/` that were already dirty before this work started. Leave those alone.

---

## Known gaps left open

- `tokyo-deep-dive`, `kyoto-zen`, and `classic-japan-14` still have `basePrice`
  values that do not match their item costs (¥120,000 vs ¥0, ¥85,000 vs ¥3,500,
  ¥265,000 vs ~¥57,000) and English activity titles. Out of scope per the spec's
  non-goals. The cost-reconciliation test is deliberately scoped to
  `golden-route` so it does not fail on them.
- `SampleItineraries.tsx` is not rendered on the homepage. It is fully built and
  translated but orphaned. Worth deciding on before launch.
