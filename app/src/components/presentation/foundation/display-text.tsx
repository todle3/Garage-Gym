import { ColorChoice, useAppTheme } from '@/hooks/useAppTheme';
import { displayText, DisplayTextVariant, GlowStrength, textGlow } from '@/theme';
import { Text, TextProps } from 'react-native';

interface DisplayTextProps extends TextProps {
  /** Which display treatment to wear. See `displayText` for what each is for. */
  variant?: DisplayTextVariant;
  color?: ColorChoice;
  /** Bloom the glyphs in their own colour. Omit for flat text - most text should be flat. */
  glow?: GlowStrength;
}

/**
 * Garage Gym's headline type: Orbitron, uppercased, widely tracked, optionally glowing.
 *
 * The counterpart to `SurfaceText`, which stays on the body face. Reach for this only where the design
 * shouts - screen titles, section headers, chips, buttons, and standalone figures.
 */
export function DisplayText({ variant = 'title', color, glow, style, ...rest }: DisplayTextProps) {
  const { colors } = useAppTheme();
  const resolved = colors[color ?? 'onSurface'];
  return (
    <Text {...rest} style={[{ color: resolved }, displayText[variant], glow && textGlow(resolved, glow), style]} />
  );
}
