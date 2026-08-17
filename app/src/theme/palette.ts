/**
 * The Garage Gym brand palette: raw colour values, no semantics.
 *
 * Everything here is a literal on purpose. LiftLog derived its colours from a seed at runtime via
 * Material 3's tonal palettes, which is the right call when the user picks the seed - but Garage Gym
 * has one fixed identity, and neon does not survive being run through a tone solver (tone 80 of a
 * vivid cyan is a pastel). Semantic mapping lives in `scheme.ts`; this file is just the ink.
 */

/** Near-blacks. Cool-shifted rather than neutral, so the neons read as light cast on a dark room. */
export const ink = {
  /** The page ground - the darkest thing in the app. */
  void: '#04070B',
  /** Below the ground: pressed states, wells, the darkest container step. */
  abyss: '#03060A',
  /** One step up from the ground, for surfaces that must separate without a border. */
  deep: '#080E15',
  /** Default card and panel fill. */
  panel: '#0A1119',
  panelHigh: '#0E1822',
  panelHighest: '#132030',
  /** Lifted surfaces (menus, sheets) that need to read as "above" the page. */
  bright: '#1A2A38',
} as const;

/**
 * Hairlines. Dim by default: in this design a border is structure, not decoration - the glow does
 * the attention-getting.
 */
export const line = {
  /** Barely-there separators inside a surface. */
  faint: '#0F1F29',
  /** Default card and control border. */
  base: '#13303C',
  /** Focused or active border. */
  bright: '#1F4A5A',
} as const;

/** The neons. These are the only saturated colours in the app, and they are never used as fills for text. */
export const neon = {
  /** Primary. Interactive, active, and "this is the app" cyan. */
  cyan: '#22E0F5',
  /** A cyan that can hold small text on a dark ground without vibrating. */
  cyanSoft: '#7FD9E8',
  /** Containers and dim states in the primary hue. */
  cyanDeep: '#0C2E38',
  /** Success, streaks, completion. */
  green: '#3DFF2E',
  greenDeep: '#0C3A0A',
  /** Chest days, destructive actions, errors. */
  magenta: '#FF2E5B',
  magentaDeep: '#4A0A1B',
  /** Leg days, tertiary accents. */
  violet: '#B054FF',
  violetDeep: '#2C1044',
  /** Full-body days, warnings. */
  amber: '#FFAA1F',
  amberDeep: '#3D2405',
  /** Rest days and anything deliberately inert. */
  slate: '#8CA3B8',
  slateDeep: '#1B2733',
} as const;

/** Text tones, brightest to faintest, all carrying the same cool cast as the grounds. */
export const text = {
  bright: '#E8F8FF',
  base: '#C6DEEC',
  muted: '#7E97AB',
  faint: '#4F6779',
  /** For text sitting on a neon fill. */
  onNeon: '#04141A',
} as const;
