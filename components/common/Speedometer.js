import React from 'react';
import OriginalSpeedometer from 'react-native-speedometer';
import { theme } from '../../themes';

const speedometerLabels = theme.colors.speedometerLabels || [
  { color: '#ff2900' },
  { color: '#ff5400' },
  { color: '#f4ab44' },
  { color: '#f2cf1f' },
  { color: '#14eb6e' },
  { color: '#00ff6b' }
];

// Modern wrapper for the Speedometer component that uses default parameters
// instead of defaultProps to fix the React warning
export default function Speedometer({
  value,
  defaultValue = 50,
  size,
  minValue = 0,
  maxValue = 100,
  easeDuration = 500,
  allowedDecimals = 0,
  labels = [
    {
      name: 'Pathetically weak',
      labelColor: speedometerLabels[0].color,
      activeBarColor: speedometerLabels[0].color
    },
    {
      name: 'Very weak',
      labelColor: speedometerLabels[1].color,
      activeBarColor: speedometerLabels[1].color
    },
    {
      name: 'So-so',
      labelColor: speedometerLabels[2].color,
      activeBarColor: speedometerLabels[2].color
    },
    {
      name: 'Fair',
      labelColor: speedometerLabels[3].color,
      activeBarColor: speedometerLabels[3].color
    },
    {
      name: 'Strong',
      labelColor: speedometerLabels[4].color,
      activeBarColor: speedometerLabels[4].color
    },
    {
      name: 'Unbelievably strong',
      labelColor: speedometerLabels[5].color,
      activeBarColor: speedometerLabels[5].color
    }
  ],
  needleImage,
  wrapperStyle = {},
  outerCircleStyle = {},
  halfCircleStyle = {},
  imageWrapperStyle = {},
  imageStyle = {},
  innerCircleStyle = {},
  labelWrapperStyle = {},
  labelStyle = {},
  labelNoteStyle = {},
  useNativeDriver = true,
  ...otherProps
}) {
  return (
    <OriginalSpeedometer
      value={value}
      defaultValue={defaultValue}
      size={size}
      minValue={minValue}
      maxValue={maxValue}
      easeDuration={easeDuration}
      allowedDecimals={allowedDecimals}
      labels={labels}
      needleImage={needleImage}
      wrapperStyle={wrapperStyle}
      outerCircleStyle={outerCircleStyle}
      halfCircleStyle={halfCircleStyle}
      imageWrapperStyle={imageWrapperStyle}
      imageStyle={imageStyle}
      innerCircleStyle={innerCircleStyle}
      labelWrapperStyle={labelWrapperStyle}
      labelStyle={labelStyle}
      labelNoteStyle={labelNoteStyle}
      useNativeDriver={useNativeDriver}
      {...otherProps}
    />
  );
} 