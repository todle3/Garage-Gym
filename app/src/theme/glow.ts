import { TextStyle, ViewStyle } from 'react-native';

/**
 * Neon bloom.
 *
 * The design's light sources sit *on* the surface and spill onto it, so a glow is a zero-offset,
 * coloured shadow - the opposite of `floating-shadow.ts`, which is a black shadow cast downward to
 * lift a surface off the page. Both platforms get one: `boxShadow` renders coloured shadows on Android
 * too under the new architecture, which the old `shadowColor` props never did.
 *
 * Glow is expensive to overuse - not in frames, in legibility. One glowing thing per card.
 */

/** How far the light spills. `soft` is ambient presence; `hard` is "this is the primary action". */
export type GlowStrength = 'soft' | 'medium' | 'hard';

const SPILL: Record<GlowStrength, { radius: number; alpha: number }> = {
  soft: { radius: 8, alpha: 0.25 },
  medium: { radius: 14, alpha: 0.4 },
  hard: { radius: 22, alpha: 0.55 },
};

/**
 * Bloom around a view. Must sit on the glowing surface itself, not a clipping ancestor - `overflow:
 * hidden` anywhere above will crop the light.
 */
export function boxGlow(color: string, strength: GlowStrength = 'medium'): ViewStyle {
  const { radius, alpha } = SPILL[strength];
  return {
    boxShadow: [{ offsetX: 0, offsetY: 0, blurRadius: radius, color: withAlpha(color, alpha) }],
  };
}

/** Bloom around glyphs. Cheaper than `boxGlow` and the right choice for neon type. */
export function textGlow(color: string, strength: GlowStrength = 'medium'): TextStyle {
  const { radius, alpha } = SPILL[strength];
  return {
    textShadowColor: withAlpha(color, alpha),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: radius,
  };
}

/**
 * Applies alpha to a `#rrggbb` colour.
 *
 * Returns non-hex input untouched: the palette is all six-digit hex, and a caller passing an `rgba()`
 * from the scheme's disabled tones has already chosen its own alpha.
 */
export function withAlpha(color: string, alpha: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(color)) {
    return color;
  }
  const channel = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${color}${channel}`;
}
