import { Material3Scheme } from '@pchmn/expo-material3-theme';
import { ink, line, neon, text } from '@/theme/palette';

/**
 * The Garage Gym scheme, mapped onto Material 3's slots.
 *
 * We keep M3's slot names because the whole component library - react-native-paper, and every
 * component in `presentation/` - is already wired to them. Only the values change, so a screen that
 * asks for `surfaceContainerHigh` keeps working and simply comes out neon-dark.
 *
 * There is one scheme, not two. The design is dark; a light Garage Gym would be a different product.
 * `app.json` pins `userInterfaceStyle` to dark so the OS agrees.
 */
export const garageGymScheme: Material3Scheme = {
  primary: neon.cyan,
  onPrimary: text.onNeon,
  primaryContainer: neon.cyanDeep,
  onPrimaryContainer: '#A8F0FB',

  secondary: neon.cyanSoft,
  onSecondary: '#062028',
  secondaryContainer: '#0C2E38',
  onSecondaryContainer: '#BDEEF8',

  tertiary: neon.violet,
  onTertiary: '#1A0630',
  tertiaryContainer: neon.violetDeep,
  onTertiaryContainer: '#E6CCFF',

  error: neon.magenta,
  onError: '#26000A',
  errorContainer: neon.magentaDeep,
  onErrorContainer: '#FFD0DA',

  background: ink.void,
  onBackground: text.base,

  surface: ink.void,
  onSurface: text.bright,
  surfaceVariant: '#12202B',
  onSurfaceVariant: text.muted,

  outline: line.bright,
  outlineVariant: line.base,

  // The inverse pair is for snackbars and tooltips, which flip to a light ground.
  inverseSurface: '#DCF3FB',
  inverseOnSurface: '#06131A',
  inversePrimary: '#00646F',

  shadow: '#000000',
  scrim: '#000000',

  // Disabled states read as "drained of light" rather than grey, hence the low-alpha bright tone.
  surfaceDisabled: 'rgba(232, 248, 255, 0.12)',
  onSurfaceDisabled: 'rgba(232, 248, 255, 0.38)',
  backdrop: 'rgba(2, 6, 10, 0.72)',

  surfaceContainerLowest: ink.abyss,
  surfaceContainerLow: ink.deep,
  surfaceContainer: ink.panel,
  surfaceContainerHigh: ink.panelHigh,
  surfaceContainerHighest: ink.panelHighest,
  surfaceBright: ink.bright,
  surfaceDim: ink.abyss,
  surfaceTint: neon.cyan,

  /**
   * Paper composites these over a surface to fake elevation. Ours climb in the same cool hue instead
   * of M3's primary-tinted overlays, so a raised surface still looks like the same material.
   */
  elevation: {
    level0: 'transparent',
    level1: ink.deep,
    level2: ink.panel,
    level3: ink.panelHigh,
    level4: ink.panelHighest,
    level5: ink.bright,
  },
};

/**
 * The named accent colours, each with the tone that stays legible on top of it.
 *
 * LiftLog harmonized these toward the seed at runtime, which pulled every colour part-way to the
 * theme's hue. Garage Gym wants the opposite: the calendar's day chips are only readable at a glance
 * because chest-red and leg-violet are unmistakably *not* the same hue.
 */
export const accentColors = {
  red: neon.magenta,
  onRed: text.onNeon,
  pink: '#FF6FA3',
  onPink: text.onNeon,
  orange: neon.amber,
  onOrange: text.onNeon,
  amber: neon.amber,
  onAmber: text.onNeon,
  yellow: '#F5F53D',
  onYellow: text.onNeon,
  lime: '#CDFF3A',
  onLime: text.onNeon,
  green: neon.green,
  onGreen: text.onNeon,
  teal: '#2BF5C8',
  onTeal: text.onNeon,
  cyan: neon.cyan,
  onCyan: text.onNeon,
  blue: '#3D9BFF',
  onBlue: text.onNeon,
  indigo: '#7B7BFF',
  onIndigo: text.onNeon,
  purple: neon.violet,
  onPurple: text.onNeon,
  brown: '#B98A5E',
  onBrown: text.onNeon,
} as const;

/**
 * The activity calendar's four graded fills, dimmest to brightest.
 *
 * A dark theme can only express intensity by getting brighter, so the ramp walks from a barely-lit
 * teal up to full primary cyan. The bottom two steps carry light text; the top two are bright enough
 * to need dark text.
 */
export const activityRampColors = {
  activityLevel1: '#0B2C36',
  onActivityLevel1: text.base,
  activityLevel2: '#12556A',
  onActivityLevel2: text.bright,
  activityLevel3: '#189FBC',
  onActivityLevel3: text.onNeon,
  activityLevel4: neon.cyan,
  onActivityLevel4: text.onNeon,
} as const;
