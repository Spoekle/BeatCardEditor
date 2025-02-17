import React from 'react';
import { Rect } from 'react-konva';

export interface RoundedRectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  roundedRadius: number;
  fill?: string;
}

const RoundedRect: React.FC<RoundedRectProps> = ({
  x,
  y,
  width,
  height,
  rotation = 0,
  opacity = 1,
  roundedRadius,
  fill = '#ccc',
}) => {
  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      opacity={opacity}
      cornerRadius={roundedRadius}
      fill={fill}
    />
  );
};

export default RoundedRect;
