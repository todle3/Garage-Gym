# Garage Gym — fork spec

This fork turns LiftLog into **Garage Gym**: a no-nonsense fitness app with a built-in AI chat that
writes daily workouts _and_ meal suggestions straight into your schedule, wearing a dark neon UI.

This doc is the decision record and roadmap. It is the thing to read before starting any Garage Gym
work; the rest of `docs/` still describes the LiftLog machinery underneath, which we keep.

## Decisions

| Area           | Decision                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------ |
| Visual scope   | **Full app-wide neon reskin** — every screen, both platforms, fully themed                  |
| Platforms      | **iOS and Android**, both themed and verified                                              |
| AI transport   | **Device-direct BYOK** — the user's own Anthropic or OpenAI API key, no backend in the path |
| Nutrition      | **Meal suggestions + daily targets**, no food logging and no check-off                      |
| AI authority   | **Chat writes directly to the schedule** via tool calls, with a confirmation card           |
| Accounts       | **Supabase auth + cloud sync** of plan, schedule, meals, and completion state               |
| Design source  | Rebuilt from the Garage Gym screenshots, with an OFL/SIL-licensed display font              |
| Cut features   | Pro purchase / RevenueCat, CSV import, plaintext export                                     |
| Kept features  | Social feed, stats, history, workout session engine, progression, remote backup             |

## Why BYOK changes the AI architecture

LiftLog's AI planner does **not** run on the device. `AiChatServiceV2`
(`app/src/services/ai-chat-service-v2.ts`) opens a SignalR connection to the LiftLog backend's
`/ai-chat-v2` hub, authenticated with a RevenueCat **pro token**; the backend
(`backend/LiftLog.Api/Service/AnthropicChatPlannerV2.cs`) holds the provider key, owns the system
prompt, and streams text and tool-input deltas back down the hub.

Garage Gym inverts this. The provider key belongs to the user, so:

- The app calls `api.anthropic.com` / `api.openai.com` **directly** and streams SSE itself. The
  planner's system prompt, tool schema, and delta accumulation move from C# into TypeScript.
- `backend/` leaves the AI path entirely. It is still there for the encrypted feed; it is no longer
  required for planning.
- The pro token disappears, and with it the paywall. `react-native-purchases` comes out.
- Keys are stored with **expo-secure-store** (iOS Keychain / Android Keystore), never in Redux
  persisted state, never in backups, never synced to Supabase.

There is **no OAuth login for AI providers**. A Claude Pro or ChatGPT Plus subscription does not grant
API access, and neither vendor offers a consumer flow that lets a third-party app spend a user's
subscription. "Log in to your own account" is implemented as: paste an API key from
`console.anthropic.com` or `platform.openai.com`, and we validate it with a cheap probe request
before saving.

### The AI planner in the meantime

Removing the paywall necessarily removed the transport with it: the hub authenticated with a RevenueCat
purchase token, so with no purchase there is nothing to authenticate, and a half-connected SignalR client
would only fail at runtime. `AiChatServiceV2` is therefore a **placeholder** - it keeps its exact
interface (the same async iterables the planner screen and its effects already consume) and answers with
`ai.planning_unavailable.*`: it acknowledges the request and says plainly that it can't act on it yet.
That mirrors what the original Garage Gym app shipped, and it means Phase 4 swaps the class body without
touching a screen. `hub-connection-factory.ts` and the `@microsoft/signalr` dependency are gone; the
device-direct client needs plain HTTPS and SSE.

What else went with the paywall: `react-native-purchases` and `-ui`, the Android `BILLING` permission,
the `proToken` preference and its `PreferenceService` methods, the `purchasePro` response variant, and
`ProPrompt`. The `persist: false` routing test that used `proToken` as its example now uses
`remoteBackupSettings`, so the mechanism stays covered.

## Nutrition is net-new

LiftLog has no concept of food. Its planner is explicitly told _"DO NOT get sidetracked by
nutrition."_ Garage Gym needs, from scratch:

- A `DayMeals` model — breakfast / lunch / dinner / snack as text, plus a daily target line
  (calories, protein) and guidance notes.
- Persistence: a new Drizzle table, plus a storage migration (see `Migrations.md`) since meals attach
  to scheduled days.
- A rewritten system prompt that treats nutrition as first-class, and a `set_daily_meals` tool
  alongside the existing plan tool.

Read-only by design: no per-item macros, no "mark eaten", no running totals. That keeps the model
small and honest about what it knows.

## The design system

Lives in **`app/src/theme/`**. Import tokens from `@/theme`; everything below is already wired into
`useAppTheme`, so a component that reads `colors.*` from the hook is already on the Garage Gym palette.

- **`palette.ts`** — the raw ink: `ink` (near-black grounds), `line` (hairlines), `neon` (the accents),
  `text` (type tones). No semantics, just values. Everything is a literal on purpose: LiftLog derived
  colours from a seed through Material 3's tone solver, which is right when the user picks the seed but
  turns a vivid cyan into a pastel.
- **`scheme.ts`** — those values mapped onto Material 3's slot names, so react-native-paper and every
  existing component keep working unchanged and simply come out neon-dark. Also `accentColors` (the
  named pairs the calendar's day chips use) and `activityRampColors` (four graded fills).
- **`typography.ts`** — `fontFamily` by role, the `displayText` variants, and `bodyFamilyForWeight`,
  which turns a requested `fontWeight` into the file that actually provides it.
- **`glow.ts`** — `boxGlow` / `textGlow` / `withAlpha`. Neon bloom is a zero-offset coloured shadow,
  the opposite of `floating-shadow.ts`'s downward black one. One glowing thing per card.
- **`paper-fonts.ts`** — the Paper typescale adapter. Deliberately *not* re-exported from `@/theme`:
  it is the only module here that imports react-native-paper, and the unit-test environment stubs React
  Native out, so keeping it separate is what lets the tokens be imported from a spec.

Contrast is enforced by `scheme.spec.ts` rather than by eye: every `on*`/fill pair, every accent as a
chip on a card, and the monotonic climb of the surface and activity ramps. Change a colour and the test
tells you whether it is still legible.

### There is one scheme, not two

The design is dark, so `app.json` pins `userInterfaceStyle` to dark and `useAppTheme` always returns
the same scheme. The only remaining appearance preference is **true black**, for OLED panels. The seed
colour picker is gone (`theme-chooser.tsx`, `color-picker-dialog.tsx`, `color-sliders.tsx` deleted) —
a fixed brand identity has nothing to pick. The `colorSchemeSeed` preference itself still exists in the
settings registry and is simply unread; removing a persisted preference is migration work for later.

### Fonts

Seven static TTFs in `app/assets/fonts/`, embedded natively by the `expo-font` config plugin (so there
is no runtime load and no flash of fallback text). **Orbitron** Bold/Black for display, **Chakra Petch**
Light→Bold for body. Both are OFL; the licences sit beside them.

Two rules when adding a weight:

1. **The filename must equal the PostScript name.** iOS resolves an embedded font by PostScript name and
   Android by filename; keeping them identical is what lets one string work on both. Verify with
   fontTools before committing.
2. **Ship a real file per weight, never `fontWeight`.** Asking the OS for a weight the family lacks gets
   you a synthesised, smeared one. Orbitron only publishes a variable font upstream, so the Bold and
   Black statics here were instanced from it with `fontTools.varLib.instancer`.

### Primitives

In `components/presentation/foundation/`:

- **`GridBackground`** — the faint square grid plus the perspective floor. Sizes itself from its own
  layout, so it works in a card or a sheet as well as a full page.
- **`BracketFrame`** — the corner-bracket card. Square-cornered on purpose; a radius softens exactly
  the thing that makes it recognisable.
- **`DisplayText`** — Orbitron, uppercased, tracked, optionally glowing. The counterpart to
  `SurfaceText`, which stays on the body face.

### Still to sweep

`SurfaceText` and Paper components now carry the right faces, but a bare react-native `<Text>` does not
inherit a family — those call sites need moving onto `SurfaceText`/`DisplayText` as each feature area is
reskinned. Light-mode branches in existing components are dead but harmless. The app has 11
`.android.tsx` variants and a react-native-paper → expo-ui migration in progress (see `AGENTS.md` and
the `expo-ui-migration` skill); native `Host`s read `colors.seedColor`, which the fixed scheme sets to
brand cyan on both platforms.

## Roadmap

Each phase is independently shippable and verifiable.

1. ~~**Design system**~~ — **done.** Fixed neon scheme, bundled fonts, display type scale, grid
   background, corner-bracket card, glow helpers. See "The design system" above.
2. ~~**Cut what's going**~~ — **done.** RevenueCat, CSV import, and plaintext export are gone, along with
   the pro-token plumbing and the SignalR transport it authenticated. See "The AI planner in the
   meantime" below.
3. **BYOK plumbing** — provider/key settings screen, secure-store service, key validation, model
   picker for Anthropic and OpenAI.
4. **On-device AI chat** — port the planner to TypeScript with direct streaming, the workout plan tool,
   and schedule-writing tool calls plus confirmation cards.
5. **Meals** — `DayMeals` model, table, migration, meal tool, Today-screen meal section with targets.
6. **Garage Gym screens** — Home (streak + today card), Today (workout + meals + schedule), Calendar
   (month toggle, coloured day chips, legend), Create Plan (chat with suggestion chips).
7. **Supabase auth + sync** — email/Apple sign-in, schema, and sync of plan/schedule/meals/completion.
8. **Reskin sweep** — remaining screens on both platforms: session, editors, stats, history, feed,
   settings.

## Settled details

**Backend.** The **Task App** Supabase project (`qbewsiyiwdnhctfvftrf`) is the one the original Garage Gym
app used; Garage Gym continues in it rather than getting a new project.

Its schema is small, and worth knowing before Phase 7 designs on top of it:

| Table                      | Columns                                   | Holds                        |
| -------------------------- | ----------------------------------------- | ---------------------------- |
| `garage_gym_completions`   | `user_id`, `day` (date)                   | One row per completed day    |
| `garage_gym_plan_messages` | `user_id`, `role` (user/assistant), `content` | The Create Plan transcript |

Both carry RLS and a foreign key to `auth.users`. As of writing: 4 users, and for one of them 14
completions spanning 2026-06-15 to 2026-06-30 plus 12 chat messages.

Note what is **absent**: there is no plan, program, exercise, or meal data. The original app's workouts
and meals were hardcoded in the client, so the calendar and the Chest A day in the screenshots never
existed as rows. LiftLog's model is far richer than these two tables can hold, so Phase 7 adds its own
and treats the legacy pair as an import source - the 14 completion dates seed the streak, the messages
seed the chat history - not as the target schema.

**Default model.** Anthropic defaults to **Sonnet 5** (`claude-sonnet-5`); Opus 5 is selectable for
users who want to spend more on planning. OpenAI defaults to its current flagship. The picker is a fixed
list per provider rather than free text, so a typo can't turn into a silent 404 mid-chat.

**Streak.** Counts **completed sessions only** - the same thing `garage_gym_completions` recorded. A day
with a logged set but no completion does not extend it.
