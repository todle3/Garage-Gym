import { describe, it, expect } from 'vitest';
import type { BoxShadowValue } from 'react-native';
import { boxGlow, textGlow, withAlpha } from './glow';

describe('withAlpha', () => {
  it('appends an alpha byte to a hex colour', () => {
    expect(withAlpha('#22E0F5', 1)).toBe('#22E0F5ff');
    expect(withAlpha('#22E0F5', 0)).toBe('#22E0F500');
    expect(withAlpha('#22E0F5', 0.5)).toBe('#22E0F580');
  });

  it('clamps out-of-range alpha', () => {
    expect(withAlpha('#22E0F5', 2)).toBe('#22E0F5ff');
    expect(withAlpha('#22E0F5', -1)).toBe('#22E0F500');
  });

  it('leaves a colour that already carries its own alpha alone', () => {
    expect(withAlpha('rgba(232, 248, 255, 0.12)', 0.5)).toBe('rgba(232, 248, 255, 0.12)');
    expect(withAlpha('transparent', 0.5)).toBe('transparent');
  });
});

/**
 * `boxShadow` is typed as a string or a list; ours is always the list, so the tests read it as one.
 * Narrowed by excluding the string rather than with `Array.isArray`, which widens a readonly array to
 * `any[]` and takes the element types with it.
 */
function shadows(style: ReturnType<typeof boxGlow>): ReadonlyArray<BoxShadowValue> {
  const { boxShadow } = style;
  if (boxShadow === undefined || typeof boxShadow === 'string') {
    throw new Error(`expected a shadow list, got ${typeof boxShadow}`);
  }
  return boxShadow;
}

describe('boxGlow', () => {
  it('spills evenly in every direction', () => {
    const [shadow] = shadows(boxGlow('#3DFF2E'));
    expect(shadow?.offsetX).toBe(0);
    expect(shadow?.offsetY).toBe(0);
    expect(shadow?.blurRadius).toBeGreaterThan(0);
  });

  it('spills further as strength climbs', () => {
    // `blurRadius` admits a string length as well as a number; ours are numbers, and Number() keeps the
    // comparator honest either way.
    const radii = (['soft', 'medium', 'hard'] as const).map((strength) =>
      Number(shadows(boxGlow('#3DFF2E', strength))[0]?.blurRadius),
    );
    expect(radii).toEqual([...radii].sort((a, b) => a - b));
  });

  it('tints the bloom with the colour it was given', () => {
    expect(shadows(boxGlow('#3DFF2E'))[0]?.color).toMatch(/^#3DFF2E[0-9a-f]{2}$/);
  });
});

describe('textGlow', () => {
  it('centres the bloom on the glyphs', () => {
    const glow = textGlow('#22E0F5');
    expect(glow.textShadowOffset).toEqual({ width: 0, height: 0 });
    expect(glow.textShadowRadius).toBeGreaterThan(0);
    expect(glow.textShadowColor).toMatch(/^#22E0F5[0-9a-f]{2}$/);
  });
});
