import { describe, it, expect } from 'vitest';
import { bodyFamilyForWeight, displayText, fontFamily, withRealWeights } from './typography';

describe('bodyFamilyForWeight', () => {
  it.each([
    [undefined, fontFamily.body],
    ['normal', fontFamily.body],
    ['bold', fontFamily.bodyBold],
    ['100', fontFamily.bodyLight],
    ['300', fontFamily.bodyLight],
    ['400', fontFamily.body],
    ['500', fontFamily.bodyMedium],
    ['600', fontFamily.bodySemiBold],
    ['700', fontFamily.bodyBold],
    ['900', fontFamily.bodyBold],
  ] as const)('maps %s to %s', (weight, expected) => {
    expect(bodyFamilyForWeight(weight)).toBe(expected);
  });

  it('accepts a numeric weight', () => {
    expect(bodyFamilyForWeight(500)).toBe(fontFamily.bodyMedium);
  });

  it('falls back to the regular face for an unparseable weight', () => {
    expect(bodyFamilyForWeight('heavy' as never)).toBe(fontFamily.body);
  });

  it('only ever returns a face we actually bundle', () => {
    const bundled = new Set(Object.values(fontFamily));
    const weights = [
      undefined,
      'normal',
      'bold',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
    ] as const;
    for (const weight of weights) {
      expect(bundled).toContain(bodyFamilyForWeight(weight));
    }
  });
});

describe('displayText', () => {
  it('uses a display face for every variant', () => {
    const displayFaces: string[] = [fontFamily.display, fontFamily.displayHeavy];
    for (const style of Object.values(displayText)) {
      expect(displayFaces).toContain(style.fontFamily);
    }
  });

  it('uppercases every variant except standalone figures', () => {
    for (const [variant, style] of Object.entries(displayText)) {
      const transform = 'textTransform' in style ? style.textTransform : undefined;
      expect(transform).toBe(variant === 'value' ? undefined : 'uppercase');
    }
  });

  it('gives every variant room for its own line height', () => {
    for (const style of Object.values(displayText)) {
      expect(style.lineHeight).toBeGreaterThan(style.fontSize);
    }
  });
});

describe('withRealWeights', () => {
  const scale = {
    bodyMedium: { fontFamily: fontFamily.body, fontWeight: '400' },
    labelLarge: { fontFamily: fontFamily.body, fontWeight: '500' },
    titleSmall: { fontFamily: fontFamily.body, fontWeight: 'bold' },
  };

  it('swaps a synthesised weight for the file that provides it', () => {
    const result = withRealWeights(scale);
    expect(result.labelLarge).toEqual({ fontFamily: fontFamily.bodyMedium, fontWeight: '400' });
    expect(result.titleSmall).toEqual({ fontFamily: fontFamily.bodyMedium, fontWeight: '400' });
  });

  it('leaves a variant already asking for a real weight untouched', () => {
    expect(withRealWeights(scale).bodyMedium).toEqual(scale.bodyMedium);
  });

  it('never leaves a weight the OS would have to fake', () => {
    for (const type of Object.values(withRealWeights(scale))) {
      expect(['400', 'normal', undefined]).toContain(type.fontWeight);
    }
  });

  it('keeps every variant of the scale it was given', () => {
    expect(Object.keys(withRealWeights(scale))).toEqual(Object.keys(scale));
  });
});
