import { TextStyle } from 'react-native';

/**
 * Font families, by role.
 *
 * Each name is both the file's basename and its PostScript name, which is what makes one string work
 * on both platforms: iOS resolves an embedded font by PostScript name, Android by filename. Keep that
 * property when adding a weight, or the font will silently fall back on one platform only.
 *
 * Weights are separate files rather than one family plus `fontWeight`, because asking the OS for a
 * weight a family doesn't have gets you a synthesised (smeared) one instead of nothing - a bug that
 * only shows up on device. Set the family, leave `fontWeight` alone.
 */
export const fontFamily = {
  /** Orbitron: wide, geometric, squared-off. Headings, numbers, and anything shouting. */
  display: 'Orbitron-Bold',
  displayHeavy: 'Orbitron-Black',
  /** Chakra Petch: squared but readable at small sizes. Everything else. */
  body: 'ChakraPetch-Regular',
  bodyLight: 'ChakraPetch-Light',
  bodyMedium: 'ChakraPetch-Medium',
  bodySemiBold: 'ChakraPetch-SemiBold',
  bodyBold: 'ChakraPetch-Bold',
} as const;

/**
 * The Chakra Petch file that stands in for a requested weight.
 *
 * Callers still think in `fontWeight`, because that is what a text component's API looks like and
 * plenty of call sites compute it (`weight={selected ? 'bold' : 'normal'}`). We translate here so the
 * OS is always handed a real face instead of being asked to fake one.
 */
export function bodyFamilyForWeight(weight: TextStyle['fontWeight']): string {
  if (weight === undefined || weight === 'normal') {
    return fontFamily.body;
  }
  if (weight === 'bold') {
    return fontFamily.bodyBold;
  }
  const numeric = typeof weight === 'number' ? weight : Number.parseInt(weight, 10);
  if (Number.isNaN(numeric)) {
    return fontFamily.body;
  }
  if (numeric <= 300) {
    return fontFamily.bodyLight;
  }
  if (numeric <= 400) {
    return fontFamily.body;
  }
  if (numeric <= 500) {
    return fontFamily.bodyMedium;
  }
  if (numeric <= 600) {
    return fontFamily.bodySemiBold;
  }
  return fontFamily.bodyBold;
}

/**
 * The display styles. Uppercase and widely tracked - the look depends on the letterspacing as much as
 * the face, so these are always applied as a unit rather than picking a family by hand.
 */
export const displayText = {
  /** Page identity and the one thing a screen is about: "GARAGE GYM", "CHEST A". */
  hero: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  /** Screen and card titles: "CALENDAR", "DAY STREAK". */
  title: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  /** Group headers that introduce a list: "WORKOUT", "MEALS", "SCHEDULE". */
  section: {
    fontFamily: fontFamily.display,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  /** Chips and micro-labels: "BACK", "REST", "TODAY // ACTIVE". */
  label: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  /** Buttons. Same treatment as a label, sized to be tapped. */
  action: {
    fontFamily: fontFamily.display,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  /** Standalone figures - a streak count, a set total. Not uppercased: there is nothing to case. */
  value: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.5,
  },
} as const satisfies Record<string, TextStyle>;

export type DisplayTextVariant = keyof typeof displayText;

/** The bit of a Material 3 typescale entry we rewrite. Structural, so this module needs no Paper import. */
interface WeightedType {
  fontFamily?: string;
  fontWeight?: string;
}

/**
 * Replaces requested weights with the file that provides them, across a whole typescale.
 *
 * Material 3's scale asks for weight 500 on several variants, which a single-weight family can only
 * answer by faking. Swapping in the Medium file and dropping back to 400 gets the same look from a real
 * face. Generic over the scale's shape so the caller keeps its exact variant keys.
 */
export function withRealWeights<T extends Record<string, WeightedType>>(scale: T): T {
  const entries = Object.entries(scale).map(([variant, type]) => {
    const needsMedium = type.fontWeight === '500' || type.fontWeight === 'bold';
    return [variant, needsMedium ? { ...type, fontFamily: fontFamily.bodyMedium, fontWeight: '400' } : type];
  });
  // Object.entries erases the key union, and the variant list belongs to the caller, not to us.
  return Object.fromEntries(entries) as T;
}
