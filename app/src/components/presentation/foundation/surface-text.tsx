import { ColorChoice, font, FontChoice, useAppTheme } from '@/hooks/useAppTheme';
import { bodyFamilyForWeight } from '@/theme';
import { Text, TextProps, TextStyle } from 'react-native';

interface SurfaceTextProps extends TextProps {
  color?: ColorChoice;
  font?: FontChoice;
  weight?: TextStyle['fontWeight'];
}

export function SurfaceText(props: SurfaceTextProps) {
  const { colors } = useAppTheme();
  const { style, weight, ...rest } = props;
  const fontChoice = props.font ?? 'text-base';
  return (
    <Text
      {...rest}
      // A weight resolves to a font file rather than a `fontWeight`: see `bodyFamilyForWeight`.
      style={[
        { color: colors[props.color ?? 'onSurface'], fontFamily: bodyFamilyForWeight(weight) },
        font[fontChoice],
        style,
      ]}
    />
  );
}
