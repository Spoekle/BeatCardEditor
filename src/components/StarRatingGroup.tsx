import React from 'react';
import { Group, Text } from 'react-konva';
import RoundedRect from './RoundedRectComponent';

export interface StarRatingGroupProps {
  x: number;
  y: number;
  boxWidth: number;
  boxHeight: number;
  spacing?: number;
  rotation?: number;
  opacity?: number;
  roundedRadius: number;
  fill?: string;
  ratingLabels?: string[];
  font?: string;
  fontSize?: number;
  fontWeight?: string | number;
  alignment?: 'left' | 'center' | 'right';
}

const StarRatingGroup: React.FC<StarRatingGroupProps> = ({
  x,
  y,
  boxWidth,
  boxHeight,
  spacing = 5,
  rotation = 0,
  opacity = 1,
  roundedRadius,
  fill = '#555',
  ratingLabels = ["ES", "NOR", "HARD", "EX", "EX+"],
  font = 'Arial',
  fontSize = 14,
  fontWeight = 'normal',
  alignment = 'center',
}) => {
  return (
    <Group x={x} y={y} rotation={rotation} opacity={opacity}>
      {ratingLabels.map((label, i) => (
        <Group key={i} x={i * (boxWidth + spacing)}>
          <RoundedRect x={0} y={0} width={boxWidth} height={boxHeight} roundedRadius={roundedRadius} fill={fill} />
          <Text
            text={label}
            x={0}
            y={boxHeight / 2 - fontSize / 2}
            width={boxWidth}
            align={alignment}
            fontFamily={font}
            fontSize={fontSize}
            fontStyle={fontWeight.toString()}
            fill="#fff"
          />
        </Group>
      ))}
    </Group>
  );
};

export default StarRatingGroup;
