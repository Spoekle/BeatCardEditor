import React from 'react';
import { Group, Rect, Text } from 'react-konva';

export interface GenericTextProps {
  text: string;
  x: number;
  y: number;
  rotation?: number;
  opacity?: number;
  roundedRadius?: number;
  font?: string;
  alignment?: 'left' | 'center' | 'right';
  fontSize?: number;
  fontWeight?: string | number;
  // Optional background properties
  bgWidth?: number;
  bgHeight?: number;
  bgFill?: string;
}

export const GenericText: React.FC<GenericTextProps> = ({
  text,
  x,
  y,
  rotation = 0,
  opacity = 1,
  roundedRadius = 0,
  font = 'Arial',
  alignment = 'left',
  fontSize = 16,
  fontWeight = 'normal',
  bgWidth,
  bgHeight,
  bgFill,
}) => {
  return (
    <Group x={x} y={y} rotation={rotation} opacity={opacity}>
      {bgWidth && bgHeight && (
        <Rect width={bgWidth} height={bgHeight} cornerRadius={roundedRadius} fill={bgFill || '#ddd'} />
      )}
      <Text 
        text={text} 
        fontFamily={font} 
        fontSize={fontSize} 
        fontStyle={fontWeight.toString()} 
        align={alignment} 
      />
    </Group>
  );
};

export const SongName: React.FC<GenericTextProps> = (props) => <GenericText {...props} />;
export const SongSubname: React.FC<GenericTextProps> = (props) => <GenericText {...props} />;
export const SongAuthor: React.FC<GenericTextProps> = (props) => <GenericText {...props} />;
export const Mapper: React.FC<GenericTextProps> = (props) => <GenericText {...props} />;
export const MapCode: React.FC<GenericTextProps> = (props) => <GenericText {...props} />;
export const BPM: React.FC<GenericTextProps> = (props) => <GenericText {...props} />;
export const SongDuration: React.FC<GenericTextProps> = (props) => <GenericText {...props} />;
