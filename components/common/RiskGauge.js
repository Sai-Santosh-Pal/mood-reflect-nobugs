import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

const SEGMENTS = [
  { color: '#4CAF50', label: 'Low' },
  { color: '#FFC107', label: 'Moderate' },
  { color: '#FF5722', label: 'High' },
];

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function RiskGauge({ value = 0, size = 220 }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = size / 2 - 20;
  const arcWidth = 18;
  const gapDeg = 2;
  const totalArc = 180;
  const segArc = (totalArc - gapDeg * (SEGMENTS.length - 1)) / SEGMENTS.length;

  const needleLength = radius - 8;
  const needleRotation = animValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['-90deg', '90deg'],
    extrapolate: 'clamp',
  });

  const svgHeight = size / 2 + 40;

  // Needle box: a square centered on the hub (cx, cy).
  // Side length = 2 * needleLength so the needle fits in any rotation.
  const needleBoxSize = needleLength * 2;
  const needleBoxLeft = cx - needleLength;
  const needleBoxTop = cy - needleLength;
  // Inside the needle SVG, the hub is at the center of the box.
  const nCx = needleLength;
  const nCy = needleLength;

  return (
    <View style={[styles.container, { width: size, height: svgHeight }]}>
      <Svg width={size} height={svgHeight} viewBox={`0 0 ${size} ${svgHeight}`}>
        {/* Track background */}
        <Path
          d={describeArc(cx, cy, radius, 180, 360)}
          stroke="#EFEFEF"
          strokeWidth={arcWidth + 6}
          fill="none"
          strokeLinecap="round"
        />

        {/* Colored segments */}
        {SEGMENTS.map((seg, i) => {
          const startAngle = 180 + i * (segArc + gapDeg);
          const endAngle = startAngle + segArc;
          return (
            <Path
              key={i}
              d={describeArc(cx, cy, radius, startAngle, endAngle)}
              stroke={seg.color}
              strokeWidth={arcWidth}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = 180 + (tick / 100) * 180;
          const outer = polarToCartesian(cx, cy, radius + arcWidth / 2 + 3, angle);
          const inner = polarToCartesian(cx, cy, radius + arcWidth / 2 + 9, angle);
          return (
            <Path
              key={tick}
              d={`M ${outer.x} ${outer.y} L ${inner.x} ${inner.y}`}
              stroke="#BBB"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Segment labels */}
        {SEGMENTS.map((seg, i) => {
          const midAngle = 180 + i * (segArc + gapDeg) + segArc / 2;
          const labelPos = polarToCartesian(cx, cy, radius - arcWidth - 6, midAngle);
          return (
            <SvgText
              key={i}
              x={labelPos.x}
              y={labelPos.y}
              fontSize={10}
              fill={seg.color}
              fontWeight="600"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {seg.label}
            </SvgText>
          );
        })}

        {/* Hub base */}
        <Circle cx={cx} cy={cy} r={13} fill="#E0E0E0" />
      </Svg>

      {/* Animated needle — square view centered on hub so rotation pivot = hub */}
      <Animated.View
        style={[
          styles.needleWrapper,
          {
            width: needleBoxSize,
            height: needleBoxSize,
            top: needleBoxTop,
            left: needleBoxLeft,
            transform: [{ rotate: needleRotation }],
          },
        ]}
      >
        <Svg
          width={needleBoxSize}
          height={needleBoxSize}
          viewBox={`0 0 ${needleBoxSize} ${needleBoxSize}`}
        >
          {/* Needle body — points straight up from center */}
          <Path
            d={`
              M ${nCx - 3.5} ${nCy}
              L ${nCx} ${nCy - needleLength + 4}
              L ${nCx + 3.5} ${nCy}
              Z
            `}
            fill="#444"
          />
          {/* Needle tip */}
          <Circle cx={nCx} cy={nCy - needleLength + 6} r={2.5} fill="#333" />
          {/* Center pin */}
          <Circle cx={nCx} cy={nCy} r={10} fill="#555" />
          <Circle cx={nCx} cy={nCy} r={5} fill="#fff" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  needleWrapper: {
    position: 'absolute',
  },
});
