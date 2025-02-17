import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import placeholder from '../images/placeholder.jpg';

export interface GenericImageProps {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number;
  rotation?: number;
  // For background only:
  blur?: number;
}

export const BackgroundImage: React.FC<GenericImageProps> = ({
  x,
  y,
  width,
  height,
  opacity = 1,
  rotation = 0,
  blur = 0,
}) => {
  const [image] = useImage(placeholder);
  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={opacity}
      rotation={rotation}
      filters={blur > 0 ? [Konva.Filters.Blur] : []}
      blurRadius={blur}
    />
  );
};

export const CoverImage: React.FC<GenericImageProps> = ({
  x,
  y,
  width,
  height,
  opacity = 1,
  rotation = 0,
}) => {
  const [image] = useImage(placeholder);
  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={opacity}
      rotation={rotation}
    />
  );
};
