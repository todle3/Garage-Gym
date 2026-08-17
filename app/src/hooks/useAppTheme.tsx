import { useAppSelector } from '@/store';
import { Material3Scheme } from '@pchmn/expo-material3-theme';
import React, { createContext, ReactNode, useContext } from 'react';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { DarkTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { MsIconSrc } from '@/components/presentation/foundation/ms-icon-source';
import { accentColors, activityRampColors, garageGymScheme, neon } from '@/theme';
import { paperFonts } from '@/theme/paper-fonts';

export const rounding = {
  roundedRectangleRadius: 10,
  roundedRectangleFocusRingRadius: 15,
  segmentedBetweenRadius: 2,
};

export const spacing = {
  pageHorizontalMargin: 16, // spacing[4]
  0: 0,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  15: 60,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
} as const;

export const font = {
  'text-2xs': {
    fontSize: 10,
    lineHeight: 14,
  },
  'text-xs': {
    fontSize: 12,
    lineHeight: 16,
  },
  'text-sm': {
    fontSize: 14,
    lineHeight: 20,
  },
  'text-base': {
    fontSize: 16,
    lineHeight: 24,
  },
  'text-lg': {
    fontSize: 18,
    lineHeight: 28,
  },
  'text-xl': {
    fontSize: 20,
    lineHeight: 28,
  },
  'text-2xl': {
    fontSize: 24,
    lineHeight: 32,
  },
  'text-3xl': {
    fontSize: 30,
    lineHeight: 40,
  },
  'text-4xl': {
    fontSize: 40,
    lineHeight: 50,
  },
} as const;

export type FontChoice = keyof typeof font;

type ColorPair<T extends string> = { [k in T | `on${Capitalize<T>}`]: string };

/** Level 0 is the absence of a session, so it has no fill of its own and no entry here. */
export type ActivityRampColors = ColorPair<'activityLevel1'> &
  ColorPair<'activityLevel2'> &
  ColorPair<'activityLevel3'> &
  ColorPair<'activityLevel4'>;

export type AppThemeColors = Material3Scheme &
  ActivityRampColors & {
    orange: string;
    onOrange: string;
    red: string;
    onRed: string;
    green: string;
    onGreen: string;
    blue: string;
    onBlue: string;
    yellow: string;
    onYellow: string;
    purple: string;
    onPurple: string;
    pink: string;
    onPink: string;
    teal: string;
    onTeal: string;
    cyan: string;
    onCyan: string;
    brown: string;
    onBrown: string;
    indigo: string;
    onIndigo: string;
    lime: string;
    onLime: string;
    amber: string;
    onAmber: string;

    seedColor: string | undefined;
  };

export type ColorChoice = keyof {
  [K in keyof AppThemeColors as AppThemeColors[K] extends string ? K : never]: AppThemeColors[K];
};

export interface AppTheme {
  colors: AppThemeColors;
  colorScheme: 'light' | 'dark';
}

const AppThemeContext = createContext<AppTheme | undefined>(undefined);

export const useAppTheme = (): AppTheme => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a AppThemeProvider');
  }
  return context;
};

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const trueBlack = useAppSelector((state) => state.settings.trueBlackDarkTheme);

  /*
   * Garage Gym has one scheme, so there is nothing to derive here and nothing to follow the system
   * for - `app.json` pins the interface style to dark. The one thing left adjustable is how black the
   * ground is: our default is a cool near-black, and true black is for OLED panels where the page
   * should disappear into the bezel.
   */
  const schemedTheme: Material3Scheme = trueBlack
    ? { ...garageGymScheme, background: '#000000', surface: '#000000' }
    : garageGymScheme;

  const paperTheme = { ...MD3DarkTheme, colors: schemedTheme, fonts: paperFonts };
  const appTheme = {
    colors: {
      ...schemedTheme,
      ...accentColors,
      ...activityRampColors,
      /*
       * Handed to expo-ui `Host`s. On Android it seeds Compose's tonal palette, on iOS it stands in
       * for the accent colour - our fixed cyan serves both, where LiftLog needed a per-platform split
       * because the seed was whatever colour the user had picked.
       */
      seedColor: neon.cyan,
    } satisfies AppThemeColors,
    colorScheme: 'dark',
  } as const;

  const navigationTheme = {
    ...DarkTheme,
    colors: {
      background: paperTheme.colors.background,
      border: paperTheme.colors.outline,
      card: paperTheme.colors.surfaceContainer,
      notification: paperTheme.colors.surface,
      primary: paperTheme.colors.primary,
      text: paperTheme.colors.onSurface,
    },
  };

  return (
    <AppThemeContext.Provider value={appTheme}>
      <PaperProvider
        theme={paperTheme}
        settings={{
          icon: (props) => <MsIconSrc {...props} color={props.color ?? appTheme.colors.onSurface} />,
        }}
      >
        <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
      </PaperProvider>
    </AppThemeContext.Provider>
  );
};
