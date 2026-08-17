import { useAppTheme } from '@/hooks/useAppTheme';
import { withAlpha } from '@/theme';
import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

interface GridBackgroundProps {
  /** Draw the perspective floor along the bottom edge. On for full pages, off inside a card. */
  floor?: boolean;
  /** Grid cell size. The default suits a phone page; smaller areas want a smaller cell. */
  cell?: number;
}

/** Barely-visible cast on the page. Any more and body text starts fighting it for attention. */
const GRID_ALPHA = 0.07;
const FLOOR_ALPHA = 0.16;
/** Share of the height the floor occupies. */
const FLOOR_RATIO = 0.2;
const FLOOR_RAYS = 15;
const FLOOR_RUNGS = 6;

/**
 * The room Garage Gym is set in: a faint square grid with a perspective floor receding at the bottom.
 *
 * Sits behind page content as a non-interactive layer, sized from its own layout rather than the window
 * so it works inside a card or a sheet as well as a full screen. Lines are plain SVG strokes - cheap
 * enough to leave mounted, and unlike a bitmap they stay crisp at any density.
 */
export function GridBackground({ floor = true, cell = 44 }: GridBackgroundProps) {
  const { colors } = useAppTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== size.width || height !== size.height) {
      setSize({ width, height });
    }
  };

  const { width, height } = size;
  const gridColor = withAlpha(colors.primary, GRID_ALPHA);
  const floorColor = withAlpha(colors.primary, FLOOR_ALPHA);

  const columns = width > 0 ? Math.ceil(width / cell) : 0;
  const rows = height > 0 ? Math.ceil(height / cell) : 0;

  // The floor's vanishing point sits on the horizon, centred: every ray fans out from it to the bottom edge.
  const floorHeight = height * FLOOR_RATIO;
  const horizonY = height - floorHeight;
  const vanishX = width / 2;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {width > 0 && height > 0 && (
        <Svg width={width} height={height}>
          {Array.from({ length: columns + 1 }, (_, i) => (
            <Line key={`v${i}`} x1={i * cell} y1={0} x2={i * cell} y2={height} stroke={gridColor} strokeWidth={1} />
          ))}
          {Array.from({ length: rows + 1 }, (_, i) => (
            <Line key={`h${i}`} x1={0} y1={i * cell} x2={width} y2={i * cell} stroke={gridColor} strokeWidth={1} />
          ))}
          {floor && (
            <>
              {Array.from({ length: FLOOR_RAYS }, (_, i) => {
                // Rays land well past both edges so the outermost ones leave the frame rather than stopping in it.
                const spread = width * 2;
                const x = vanishX - spread / 2 + (spread * i) / (FLOOR_RAYS - 1);
                return (
                  <Line
                    key={`r${i}`}
                    x1={vanishX}
                    y1={horizonY}
                    x2={x}
                    y2={height}
                    stroke={floorColor}
                    strokeWidth={1}
                  />
                );
              })}
              {Array.from({ length: FLOOR_RUNGS }, (_, i) => {
                // Squared spacing is what sells the recession: rungs crowd at the horizon and open up underfoot.
                const t = (i + 1) / FLOOR_RUNGS;
                const y = horizonY + floorHeight * t * t;
                return <Line key={`g${i}`} x1={0} y1={y} x2={width} y2={y} stroke={floorColor} strokeWidth={1} />;
              })}
            </>
          )}
        </Svg>
      )}
    </View>
  );
}
