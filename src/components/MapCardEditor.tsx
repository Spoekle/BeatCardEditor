import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Image, Transformer, Group, Line } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import configData from '../config/ssConfig.json';
import placeholder from '../images/placeholder.jpg';

const gridSize = 10;
const snap = (value: number) => Math.round(value / gridSize) * gridSize;

// ----- Type Definitions -----
interface BackgroundConfig { /* ...existing... */ }

interface RoundedRectComponent {
  id: string;
  type: 'roundedRect';
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius: number;
  fillStyle: string;
}

interface TextFieldComponent {
  id: string;
  type: 'textField';
  field: 'mapname' | 'author' | 'mapper' | 'mapsubname' | 'duration';
  x: number;
  y: number;
  text: string;
  font: string;
  fillStyle: string;
  maxWidth: number;
  textAlign?: string;
}

interface ImageComponent {
  id: string;
  type: 'coverImage' | 'backgroundComponent';
  x: number;
  y: number;
  width: number;
  height: number;
  srcField: string;
  clip?: boolean;
  shadow?: { color: string; offsetX: number; offsetY: number; blur: number };
}

// New starRating definition (rendered as a set of rounded rectangles)
interface StarRatingComponent {
  id: string;
  type: 'starRating';
  x: number;
  y: number;
  ratingLabels: string[]; // e.g. ["ES", "NOR", "HARD", "EX", "EX+"]
  width: number;     // width of each box
  height: number;    // height of each box
  cornerRadius: number;
  fillStyle: string;
}

type ComponentModel = RoundedRectComponent | TextFieldComponent | ImageComponent | StarRatingComponent;

interface MapCardConfig {
  configName: string;
  width: number;
  height: number;
  cardCornerRadius: number;
  background: BackgroundConfig;
  components: ComponentModel[];
}

// ----- Build Initial Card State -----
const buildInitialCard = (): MapCardConfig => {
  const data = configData as MapCardConfig;
  data.components = data.components.map((comp, i) => ({
    ...comp,
    id: (comp as any).id || `comp${i + 1}`
  }));
  return data;
};
const initialCard = buildInitialCard();

// ----- Background Image Component -----
const BackgroundImage = ({ bg, width, height }: { bg: BackgroundConfig; width: number; height: number; }) => {
  const [image] = useImage(placeholder);
  return (
    <Image
      x={0} y={0} width={width} height={height}
      image={image}
      filters={bg.blur > 0 ? [Konva.Filters.Blur] : []}
      blurRadius={bg.blur}
    />
  );
};

// ----- Main MapCardEditor Component -----
const MapCardEditor: React.FC = () => {
  const [card, setCard] = useState<MapCardConfig>(initialCard);
  const [unusedComponents, setUnusedComponents] = useState<ComponentModel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    if (transformerRef.current && selectedId && stageRef.current) {
      const selectedNode = stageRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedId]);

  const handleDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const newX = snap(e.target.x());
    const newY = snap(e.target.y());
    setCard(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === id ? { ...comp, x: newX, y: newY } : comp
      )
    }));
  };

  const handleTransformEnd = (id: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    setCard(prev => ({
      ...prev,
      components: prev.components.map(comp => {
        if (comp.id !== id) return comp;
        // For text field, update only position
        if (comp.type === 'textField') return { ...comp, x: snap(node.x()), y: snap(node.y()) };
        return {
          ...comp,
          x: snap(node.x()),
          y: snap(node.y()),
          width: Math.round(node.width() * node.scaleX()),
          height: Math.round(node.height() * node.scaleY())
        };
      })
    }));
    node.scaleX(1);
    node.scaleY(1);
  };

  const removeComponent = (id: string) => {
    setCard(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== id)
    }));
    setSelectedId(null);
  };

  // ---- Grid Rendering ----
  const renderGrid = () => {
    const lines = [];
    for (let i = gridSize; i < card.width; i += gridSize) {
      lines.push(<Line key={`v-${i}`} points={[i, 0, i, card.height]} stroke="#ddd" strokeWidth={0.5} />);
    }
    for (let j = gridSize; j < card.height; j += gridSize) {
      lines.push(<Line key={`h-${j}`} points={[0, j, card.width, j]} stroke="#ddd" strokeWidth={0.5} />);
    }
    return <Group>{lines}</Group>;
  };

  // ----- Render Star Rating Component -----
  const renderStarRating = (comp: StarRatingComponent) => {
    const spacing = 5;
    const labels = comp.ratingLabels && comp.ratingLabels.length > 0 ? comp.ratingLabels : ["ES", "NOR", "HARD", "EX", "EX+"];
    return (
      <Group key={comp.id} id={comp.id} x={comp.x} y={comp.y} draggable
        onClick={() => setSelectedId(comp.id)}
        onDragEnd={(e) => handleDragEnd(comp.id, e)}
        onDragStart={(e) => e.evt.dataTransfer && e.evt.dataTransfer.setData('fromCanvas', comp.id)}>
        {labels.map((label, i) => (
          <Group key={i} x={i * (comp.width + spacing)}>
            <Rect width={comp.width} height={comp.height} cornerRadius={comp.cornerRadius} fill={comp.fillStyle} />
            <Text text={label} x={0} y={comp.height/2 - 8} fontSize={comp.height/2} fill="#fff" width={comp.width} align="center" />
          </Group>
        ))}
      </Group>
    );
  };

  // ----- Render Other Components -----
  const renderComponent = (comp: ComponentModel) => {
    const commonProps = {
      draggable: true,
      onClick: () => setSelectedId(comp.id),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(comp.id, e),
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(comp.id, e),
      onDragStart: (e: Konva.KonvaEventObject<DragEvent>) =>
        e.evt.dataTransfer && e.evt.dataTransfer.setData('fromCanvas', comp.id)
    };
    switch (comp.type) {
      case 'roundedRect':
        return (
          <Rect key={comp.id} id={comp.id}
            x={comp.x} y={comp.y} width={comp.width} height={comp.height}
            cornerRadius={comp.cornerRadius} fill={comp.fillStyle} {...commonProps} />
        );
      case 'textField':
        return (
          <Text key={comp.id} id={comp.id}
            x={comp.x} y={comp.y} text={comp.text}
            font={comp.font} fill={comp.fillStyle} width={comp.maxWidth} align={comp.textAlign || 'left'}
            {...commonProps} />
        );
      case 'coverImage':
      case 'backgroundComponent':
        return (
          <EditableImage key={comp.id} comp={comp as ImageComponent}
            onSelect={() => setSelectedId(comp.id)}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
          />
        );
      case 'starRating':
        return renderStarRating(comp as StarRatingComponent);
      default:
        return null;
    }
  };

  // ------ Properties Panel for Selected Component ------
  const renderPropertiesPanel = () => {
    const comp = card.components.find(c => c.id === selectedId);
    if (!comp) return null;
    const updateProp = (prop: string, value: any) => {
      setCard(prev => ({
        ...prev,
        components: prev.components.map(c => c.id === selectedId ? { ...c, [prop]: value } : c)
      }));
    };
    return (
      <div>
        <h4>Properties</h4>
        {comp.type === 'roundedRect' && (
          <div>
            <label>Corner Radius:</label>
            <input type="number" value={comp.cornerRadius} onChange={(e) => updateProp('cornerRadius', Number(e.target.value))} />
          </div>
        )}
        {comp.type === 'textField' && (
          <div>
            <label>Text Alignment:</label>
            <select value={comp.textAlign || 'left'} onChange={(e) => updateProp('textAlign', e.target.value)}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        )}
        {comp.type === 'starRating' && (
          <div>
            <label>Corner Radius:</label>
            <input type="number" value={comp.cornerRadius} onChange={(e) => updateProp('cornerRadius', Number(e.target.value))} />
            {/* Additional properties (width, height, fillStyle) could be added similarly */}
          </div>
        )}
      </div>
    );
  };

  // ------ Drag and Drop for Available Components ------
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, componentType: string) => {
    e.dataTransfer.setData('componentType', componentType);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); };

  // Drop handler for canvas (from toolbar or unused area)
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType');
    if (!stageRef.current) return;
    const stage = stageRef.current.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    const newX = snap(pointerPos.x);
    const newY = snap(pointerPos.y);
    const id = `new_${Date.now()}`;
    let newComp: ComponentModel;
    switch(componentType){
      case 'coverImage':
        newComp = { id, type: 'coverImage', x: newX, y: newY, width: 150, height: 150, srcField: 'cover' };
        break;
      case 'backgroundComponent':
        newComp = { id, type: 'backgroundComponent', x: newX, y: newY, width: 200, height: 150, srcField: 'background' };
        break;
      case 'roundedRect':
        newComp = { id, type: 'roundedRect', x: newX, y: newY, width: 100, height: 50, cornerRadius: 10, fillStyle: '#8ED6FF' };
        break;
      case 'mapname':
      case 'author':
      case 'mapper':
      case 'mapsubname':
      case 'duration':
        newComp = { 
          id, 
          type: 'textField', 
          field: componentType as TextFieldComponent["field"],
          x: newX, 
          y: newY, 
          text: (componentType.charAt(0).toUpperCase() + componentType.slice(1)), 
          font: 'Arial', 
          fillStyle: '#000', 
          maxWidth: 200, 
          textAlign: 'left' 
        };
        break;
      case 'starRating':
        newComp = { 
          id, 
          type: 'starRating',
          x: newX, 
          y: newY, 
          ratingLabels: ["ES", "NOR", "HARD", "EX", "EX+"],
          width: 40,
          height: 30,
          cornerRadius: 5,
          fillStyle: '#555'
        };
        break;
      default:
        return;
    }
    setCard(prev => ({
      ...prev,
      components: [...prev.components, newComp]
    }));
  };

  // Drop handler for "Not Used" zone (drag from canvas)
  const handleUnusedDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fromCanvasId = e.dataTransfer.getData('fromCanvas');
    if (!fromCanvasId) return;
    const compToRemove = card.components.find(comp => comp.id === fromCanvasId);
    if (!compToRemove) return;
    // Remove from canvas and add to unused list (if not already there)
    setCard(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== fromCanvasId)
    }));
    setUnusedComponents(prev => [...prev, compToRemove]);
  };

  // ------ Export Layout Function ------
  const exportLayout = () => {
    const exportJSON = JSON.stringify(card, null, 2);
    alert(exportJSON);
  };

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ marginBottom: '5px' }}>
            <button onClick={exportLayout}>Export Layout</button>
            <button onClick={() => selectedId && removeComponent(selectedId)}>Remove Selected</button>
          </div>
          <Stage width={card.width + 50} height={card.height + 50}
            onDrop={handleDrop} onDragOver={handleDragOver} ref={stageRef}
            style={{ border: '1px solid grey' }}>
            <Layer>
              {renderGrid()}
              {/* Render background */}
              {card.background && (
                <BackgroundImage bg={card.background} width={card.width} height={card.height} />
              )}
              {/* Card mask */}
              <Rect x={0} y={0} width={card.width} height={card.height} cornerRadius={initialCard.cardCornerRadius} />
              {/* Render components on canvas */}
              {card.components.map(comp => renderComponent(comp))}
              <Transformer ref={transformerRef} anchorSize={8} borderDash={[6, 2]} />
            </Layer>
          </Stage>
        </div>
        <div style={{ width: 200, padding: '10px', borderLeft: '1px solid #ccc' }}>
          {selectedId ? renderPropertiesPanel() : <div>Select a component</div>}
        </div>
      </div>
      {/* Bottom toolbar for available components */}
      <div style={{ marginTop: '10px', borderTop: '1px solid #ccc', padding: '10px', display: 'flex', gap: '10px' }}>
        <div draggable onDragStart={(e) => handleDragStart(e, 'coverImage')} style={{ cursor: 'grab' }}>Cover Image</div>
        <div draggable onDragStart={(e) => handleDragStart(e, 'backgroundComponent')} style={{ cursor: 'grab' }}>Background</div>
        <div draggable onDragStart={(e) => handleDragStart(e, 'roundedRect')} style={{ cursor: 'grab' }}>Rounded Rect</div>
        <div draggable onDragStart={(e) => handleDragStart(e, 'mapname')} style={{ cursor: 'grab' }}>Map Name</div>
        <div draggable onDragStart={(e) => handleDragStart(e, 'author')} style={{ cursor: 'grab' }}>Author</div>
        <div draggable onDragStart={(e) => handleDragStart(e, 'mapper')} style={{ cursor: 'grab' }}>Mapper</div>
        <div draggable onDragStart={(e) => handleDragStart(e, 'mapsubname')} style={{ cursor: 'grab' }}>Map Subname</div>
        <div draggable onDragStart={(e) => handleDragStart(e, 'duration')} style={{ cursor: 'grab' }}>Duration</div>
        <div draggable onDragStart={(e) => handleDragStart(e, 'starRating')} style={{ cursor: 'grab' }}>Star Ratings</div>
      </div>
      {/* "Not Used" zone for dragging components off the canvas */}
      <div id="unusedZone" onDrop={handleUnusedDrop} onDragOver={handleDragOver}
        style={{ marginTop: '10px', border: '1px dashed #999', padding: '10px', minHeight: '50px' }}>
        <strong>Not Used Components:</strong>
        {unusedComponents.map(comp => (
          <div key={comp.id} style={{ margin: '5px 0' }}>
            {comp.type} - {('field' in comp ? comp.field : comp.id)}
          </div>
        ))}
      </div>
    </div>
  );
};

// ----- Editable Image Component -----
type EditableImageProps = {
  comp: ImageComponent;
  onSelect: () => void;
  onDragEnd: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (id: string, e: Konva.KonvaEventObject<Event>) => void;
};

const EditableImage: React.FC<EditableImageProps> = ({ comp, onSelect, onDragEnd, onTransformEnd }) => {
  const [image] = useImage(placeholder);
  return (
    <Image
      id={comp.id}
      x={comp.x} y={comp.y} width={comp.width} height={comp.height}
      image={image} draggable
      onClick={onSelect}
      onDragEnd={(e) => onDragEnd(comp.id, e)}
      onTransformEnd={(e) => onTransformEnd(comp.id, e)}
      shadowColor={comp.shadow?.color}
      shadowOffsetX={comp.shadow?.offsetX}
      shadowOffsetY={comp.shadow?.offsetY}
      shadowBlur={comp.shadow?.blur}
      onDragStart={(e) => e.evt.dataTransfer && e.evt.dataTransfer.setData('fromCanvas', comp.id)}
    />
  );
};

export default MapCardEditor;
