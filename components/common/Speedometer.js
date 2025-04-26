import React from 'react';
import OriginalSpeedometer from 'react-native-speedometer';

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
      labelColor: '#ff2900',
      activeBarColor: '#ff2900'
    },
    {
      name: 'Very weak',
      labelColor: '#ff5400',
      activeBarColor: '#ff5400'
    },
    {
      name: 'So-so',
      labelColor: '#f4ab44',
      activeBarColor: '#f4ab44'
    },
    {
      name: 'Fair',
      labelColor: '#f2cf1f',
      activeBarColor: '#f2cf1f'
    },
    {
      name: 'Strong',
      labelColor: '#14eb6e',
      activeBarColor: '#14eb6e'
    },
    {
      name: 'Unbelievably strong',
      labelColor: '#00ff6b',
      activeBarColor: '#00ff6b'
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