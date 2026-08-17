import { describe, it, expect } from 'vitest';
import { accentColors, activityRampColors, garageGymScheme } from './scheme';

/**
 * Relative luminance and contrast per WCAG 2.1. Lives in the test rather than in `utils/color` because
 * nothing at runtime needs it - the palette is fixed, so contrast is a property to assert once here and
 * never recompute on device.
 */
function luminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) {
    throw new Error(`not a #rrggbb colour: ${hex}`);
  }
  const channels = [0, 2, 4].map((offset) => Number.parseInt(match[1]!.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

function contrast(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter! + 0.05) / (darker! + 0.05);
}

/**
 * WCAG AA for large text, which is what the neons carry: display type, chips, and button labels are all
 * bold and 14pt-plus. Body copy runs in `onSurface` on a near-black ground, which clears AA for normal
 * text by a wide margin and is covered below.
 */
const LARGE_TEXT_AA = 3;
const NORMAL_TEXT_AA = 4.5;

describe('garageGymScheme', () => {
  it.each([
    ['onPrimary on primary', 'onPrimary', 'primary'],
    ['onSecondary on secondary', 'onSecondary', 'secondary'],
    ['onTertiary on tertiary', 'onTertiary', 'tertiary'],
    ['onError on error', 'onError', 'error'],
    ['onPrimaryContainer on primaryContainer', 'onPrimaryContainer', 'primaryContainer'],
    ['onSecondaryContainer on secondaryContainer', 'onSecondaryContainer', 'secondaryContainer'],
    ['onTertiaryContainer on tertiaryContainer', 'onTertiaryContainer', 'tertiaryContainer'],
    ['onErrorContainer on errorContainer', 'onErrorContainer', 'errorContainer'],
    ['inverseOnSurface on inverseSurface', 'inverseOnSurface', 'inverseSurface'],
  ] as const)('keeps %s legible', (_label, foreground, background) => {
    expect(contrast(garageGymScheme[foreground], garageGymScheme[background])).toBeGreaterThanOrEqual(NORMAL_TEXT_AA);
  });

  it.each([
    ['surface', 'surface'],
    ['background', 'background'],
    ['surfaceContainer', 'surfaceContainer'],
    ['surfaceContainerHighest', 'surfaceContainerHighest'],
    ['surfaceBright', 'surfaceBright'],
  ] as const)('keeps body text legible on %s', (_label, background) => {
    expect(contrast(garageGymScheme.onSurface, garageGymScheme[background])).toBeGreaterThanOrEqual(NORMAL_TEXT_AA);
  });

  it('keeps the muted tone usable for supporting text on a card', () => {
    expect(contrast(garageGymScheme.onSurfaceVariant, garageGymScheme.surfaceContainer)).toBeGreaterThanOrEqual(
      NORMAL_TEXT_AA,
    );
  });

  it('keeps primary readable as a link or active label on the page ground', () => {
    expect(contrast(garageGymScheme.primary, garageGymScheme.background)).toBeGreaterThanOrEqual(NORMAL_TEXT_AA);
  });

  it('climbs monotonically through the surface container steps', () => {
    const steps = [
      garageGymScheme.surfaceContainerLowest,
      garageGymScheme.surfaceContainerLow,
      garageGymScheme.surfaceContainer,
      garageGymScheme.surfaceContainerHigh,
      garageGymScheme.surfaceContainerHighest,
      garageGymScheme.surfaceBright,
    ].map(luminance);
    const ascending = [...steps].sort((a, b) => a - b);
    expect(steps).toEqual(ascending);
  });

  it('keeps the outline visible against the surface it borders', () => {
    // Not a text ratio: a hairline only has to be findable, and the design wants it quiet.
    expect(contrast(garageGymScheme.outline, garageGymScheme.surfaceContainer)).toBeGreaterThan(1.3);
  });
});

describe('accentColors', () => {
  // Spelled out as pairs rather than derived: a computed `on${Capitalize<name>}` key is not something
  // the compiler can check, and an accent silently missing its foreground is exactly what this guards.
  const accentPairs = [
    ['red', 'onRed'],
    ['pink', 'onPink'],
    ['orange', 'onOrange'],
    ['amber', 'onAmber'],
    ['yellow', 'onYellow'],
    ['lime', 'onLime'],
    ['green', 'onGreen'],
    ['teal', 'onTeal'],
    ['cyan', 'onCyan'],
    ['blue', 'onBlue'],
    ['indigo', 'onIndigo'],
    ['purple', 'onPurple'],
    ['brown', 'onBrown'],
  ] as const;
  const accentNames = accentPairs.map(([name]) => name);

  it('covers every accent the scheme exposes', () => {
    expect(new Set(accentPairs.flat())).toEqual(new Set(Object.keys(accentColors)));
  });

  it.each(accentPairs)('pairs %s with a legible foreground', (name, onName) => {
    expect(contrast(accentColors[onName], accentColors[name])).toBeGreaterThanOrEqual(LARGE_TEXT_AA);
  });

  it.each(accentNames)('keeps %s legible as an outline-and-label chip on a card', (name) => {
    // The calendar's day chips draw the accent as text on the card fill, not as a fill of their own.
    expect(contrast(accentColors[name], garageGymScheme.surfaceContainer)).toBeGreaterThanOrEqual(LARGE_TEXT_AA);
  });

  it('keeps the day-type accents distinguishable from one another', () => {
    // Chest, legs, back, full body, and run must never be mistaken at a glance on the calendar.
    const dayTypes = [accentColors.red, accentColors.purple, accentColors.cyan, accentColors.amber, accentColors.green];
    expect(new Set(dayTypes).size).toBe(dayTypes.length);
  });
});

describe('activityRampColors', () => {
  it('gets brighter at every step', () => {
    const steps = [
      activityRampColors.activityLevel1,
      activityRampColors.activityLevel2,
      activityRampColors.activityLevel3,
      activityRampColors.activityLevel4,
    ].map(luminance);
    expect(steps).toEqual([...steps].sort((a, b) => a - b));
  });

  it.each([1, 2, 3, 4] as const)('keeps level %i legible against its own fill', (level) => {
    expect(
      contrast(activityRampColors[`onActivityLevel${level}`], activityRampColors[`activityLevel${level}`]),
    ).toBeGreaterThanOrEqual(LARGE_TEXT_AA);
  });

  it('separates the dimmest fill from the card it sits on', () => {
    expect(contrast(activityRampColors.activityLevel1, garageGymScheme.surfaceContainer)).toBeGreaterThan(1.2);
  });
});
