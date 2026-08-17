import { configureFonts } from 'react-native-paper';
// Type-only: the path is a declaration file, so a value import would be resolved (and choke) at runtime.
import type { MD3Typescale } from 'react-native-paper/lib/typescript/types';
import { fontFamily, withRealWeights } from '@/theme/typography';

/**
 * Paper's typescale, moved onto our families.
 *
 * Paper ships MD3 sizes we're happy with, so we keep its metrics and swap the faces: display and
 * headline variants become Orbitron, everything else Chakra Petch.
 *
 * Kept out of `theme/index.ts` on purpose. This is the one module in `theme/` that pulls in
 * react-native-paper, and the unit test environment stubs React Native out entirely - so the tokens
 * stay importable from a spec, and only `useAppTheme` (which is native-only anyway) reaches for this.
 */
const bodyTypescale = withRealWeights(configureFonts({ config: { fontFamily: fontFamily.body } }));

export const paperFonts: MD3Typescale = {
  ...bodyTypescale,
  displayLarge: { ...bodyTypescale.displayLarge, fontFamily: fontFamily.displayHeavy, letterSpacing: 1.5 },
  displayMedium: { ...bodyTypescale.displayMedium, fontFamily: fontFamily.displayHeavy, letterSpacing: 1.5 },
  displaySmall: { ...bodyTypescale.displaySmall, fontFamily: fontFamily.display, letterSpacing: 1.2 },
  headlineLarge: { ...bodyTypescale.headlineLarge, fontFamily: fontFamily.display, letterSpacing: 1.2 },
  headlineMedium: { ...bodyTypescale.headlineMedium, fontFamily: fontFamily.display, letterSpacing: 1 },
  headlineSmall: { ...bodyTypescale.headlineSmall, fontFamily: fontFamily.display, letterSpacing: 1 },
  titleLarge: { ...bodyTypescale.titleLarge, fontFamily: fontFamily.bodySemiBold },
  titleMedium: { ...bodyTypescale.titleMedium, fontFamily: fontFamily.bodySemiBold },
  titleSmall: { ...bodyTypescale.titleSmall, fontFamily: fontFamily.bodyMedium },
  labelLarge: { ...bodyTypescale.labelLarge, fontFamily: fontFamily.bodyMedium, letterSpacing: 0.8 },
};
