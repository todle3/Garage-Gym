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

## Theming approach

The good news: theme derivation is already centralised in `app/src/hooks/useAppTheme.tsx`, which
generates a Material 3 scheme from a seed colour and exposes named colour pairs
(`red`/`onRed`, `cyan`/`onCyan`, …) that components consume. Most of the reskin is:

1. Replace dynamic Material 3 generation with a **fixed Garage Gym scheme** — near-black grounds,
   neon cyan primary, neon green success/streak, magenta, amber, violet accents — while keeping the
   same `AppThemeColors` shape so existing components keep compiling.
2. Bundle the display font via `expo-font` and add uppercase, letterspaced display text styles to the
   `font` scale.
3. Add the Garage Gym chrome as foundation primitives: perspective grid background, corner-bracket
   card frame, glow/outline buttons, accent-bar list rows.
4. Sweep feature areas onto those primitives.

Note the app has 11 `.android.tsx` platform-split variants and a react-native-paper → expo-ui
migration in progress (see `AGENTS.md` and the `expo-ui-migration` skill). Native `Host`s take
`colors.seedColor`, so the fixed scheme must set that too.

## Roadmap

Each phase is independently shippable and verifiable.

1. **Design system** — fixed neon scheme, font, display type scale, grid background, corner-bracket
   card, neon buttons. No feature changes.
2. **Cut what's going** — remove RevenueCat, CSV import, and plaintext export, including the pro-token
   plumbing threaded through the AI service and settings.
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

## Open items

- No Supabase project exists for this app yet; one needs creating (it costs money on a paid org, so it
  needs explicit sign-off).
- Default model per provider, and whether the model picker is a fixed list or free text.
- Whether the streak on the home screen counts completed sessions only, or any logged activity.
