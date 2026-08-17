import { ColorChoice, useAppTheme } from '@/hooks/useAppTheme';
import { boxGlow, GlowStrength, withAlpha } from '@/theme';
import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';

/**
 * Which corners wear a bracket. `diagonal` - top-left and bottom-right - is the house style: it frames
 * a card without boxing it in, and reads as a targeting reticle rather than a border.
 */
export type BracketCorners = 'diagonal' | 'all' | 'none';

interface BracketFrameProps {
  children: ReactNode;
  /** Border, bracket, and glow colour. Defaults to the dim structural hairline. */
  color?: ColorChoice;
  corners?: BracketCorners;
  /** Bloom the frame. The design uses this on the one card a screen is about, not on every card. */
  glow?: GlowStrength;
  /** Fill behind the children. Transparent by default, so the page's grid shows through. */
  background?: ColorChoice;
  style?: ViewStyle;
  padding?: number;
}

const BRACKET_SIZE = 22;
const BRACKET_WEIGHT = 3;

/** One corner's L, drawn as a view wearing only the two borders that meet at that corner. */
function Bracket({ corner, color }: { corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'; color: string }) {
  const isTop = corner === 'topLeft' || corner === 'topRight';
  const isLeft = corner === 'topLeft' || corner === 'bottomLeft';
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: BRACKET_SIZE,
        height: BRACKET_SIZE,
        top: isTop ? -1 : undefined,
        bottom: isTop ? undefined : -1,
        left: isLeft ? -1 : undefined,
        right: isLeft ? undefined : -1,
        borderColor: color,
        borderTopWidth: isTop ? BRACKET_WEIGHT : 0,
        borderBottomWidth: isTop ? 0 : BRACKET_WEIGHT,
        borderLeftWidth: isLeft ? BRACKET_WEIGHT : 0,
        borderRightWidth: isLeft ? 0 : BRACKET_WEIGHT,
      }}
    />
  );
}

/**
 * The Garage Gym card: a hairline rectangle with brackets clamped to its corners.
 *
 * Deliberately square. The rest of the app rounds its corners via `rounding`, but this frame is meant
 * to read as machined panel rather than Material card, and a radius softens exactly the thing that
 * makes it recognisable.
 */
export function BracketFrame({
  children,
  color = 'outlineVariant',
  corners = 'diagonal',
  glow,
  background,
  style,
  padding,
}: BracketFrameProps) {
  const { colors } = useAppTheme();
  const frameColor = colors[color];
  const shown: Array<'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'> =
    corners === 'all'
      ? ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
      : corners === 'diagonal'
        ? ['topLeft', 'bottomRight']
        : [];

  return (
    <View
      style={[
        {
          borderWidth: 1,
          // The border is the frame's quiet state; the brackets carry the accent at full strength.
          borderColor: withAlpha(frameColor, 0.55),
          backgroundColor: background ? colors[background] : undefined,
          padding,
        },
        glow && boxGlow(frameColor, glow),
        style,
      ]}
    >
      {children}
      {shown.map((corner) => (
        <Bracket key={corner} corner={corner} color={frameColor} />
      ))}
    </View>
  );
}
