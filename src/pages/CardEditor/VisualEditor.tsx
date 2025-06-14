import React, { useRef, useEffect } from 'react';
import placeholder from '../../images/placeholder.jpg';
import Button from '../Components/Button';

export interface ComponentType {
  id: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: any;
}

interface CardConfig {
    configName: string;
    width: number;
    height: number;
    cardCornerRadius: number;
    background: {
      type: string;
      srcField?: string;
      blur?: number;
      rotation?: number;
      color?: string;
    };
    components: ComponentType[];
  }

interface VisualEditorProps {
  config: CardConfig;
  setConfig: React.Dispatch<React.SetStateAction<CardConfig>>;
  addComponent: (comp: ComponentType) => void;
  fetchedData?: any; 
}

const VisualEditor: React.FC<VisualEditorProps> = ({ config, setConfig, addComponent, fetchedData }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const scale = 1;
  const gridStep = 10;
  const snap = (val: number, step: number) => Math.round(val / step) * step;

  const getNestedValue = (obj: any, path: string): any =>
    path.split('.').reduce((acc, part) => acc && acc[part], obj);

  const [newType, setNewType] = React.useState<string>('text');
  const [selectedComponentId, setSelectedComponentId] = React.useState<number | null>(null);
  const [draggingId, setDraggingId] = React.useState<number | null>(null);
  const [offset, setOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizingInfo, setResizingInfo] = React.useState<{ id: number; startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, comp: ComponentType) => {
    setSelectedComponentId(comp.id);
    setDraggingId(comp.id);
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setOffset({ x: e.clientX - rect.left - comp.x * scale, y: e.clientY - rect.top - comp.y * scale });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (resizingInfo) {
      const deltaX = (e.clientX - resizingInfo.startX) / scale;
      const deltaY = (e.clientY - resizingInfo.startY) / scale;
      const newWidth = Math.max(20, snap(resizingInfo.startWidth + deltaX, gridStep));
      const newHeight = Math.max(20, snap(resizingInfo.startHeight + deltaY, gridStep));
      setConfig({
        ...config,
        components: config.components.map(comp =>
          comp.id === resizingInfo.id
            ? { ...comp, width: newWidth, height: newHeight }
            : comp
        )
      });
      return;
    }
    if (draggingId === null) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newX = (e.clientX - rect.left - offset.x) / scale;
    const newY = (e.clientY - rect.top - offset.y) / scale;
    setConfig({
      ...config,
      components: config.components.map(comp =>
        comp.id === draggingId ? { ...comp, x: newX, y: newY } : comp
      )
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, comp: ComponentType) => {
    e.stopPropagation();
    setResizingInfo({
      id: comp.id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: comp.width,
      startHeight: comp.height
    });
  };

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (draggingId === null) return;
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const newX = (e.clientX - rect.left - offset.x) / scale;
      const newY = (e.clientY - rect.top - offset.y) / scale;
      setConfig({
        ...config,
        components: config.components.map(comp =>
          comp.id === draggingId ? { ...comp, x: newX, y: newY } : comp
        )
      });
    };
    if (draggingId !== null) {
      window.addEventListener('mousemove', handleWindowMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, [draggingId, offset, config, setConfig]);

  const handleMouseUp = () => {
    if (draggingId !== null) {
      setConfig({
        ...config,
        components: config.components.map(comp => {
          if (comp.id === draggingId) {
            return { ...comp, x: snap(comp.x, gridStep), y: snap(comp.y, gridStep) };
          }
          return comp;
        })
      });
    }
    setDraggingId(null);
    setResizingInfo(null);
  };

  const handleAddComponent = () => {
    let comp: ComponentType;
    if(newType === 'text') {
      comp = {
        id: Date.now(),
        type: 'text',
        x: 0,
        y: 0,
        width: 100,
        height: 30,
        maxWidth: 100,
        text: 'New Text',
        font: '24px sans-serif',
        fillStyle: 'black',
        textAlign: 'left'
      };
    } else if(newType === 'image') {
      comp = {
        id: Date.now(),
        type: 'image',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        srcField: "versions.0.coverURL",
        cornerRadius: 0,
        clip: true,
        shadow: { color: "rgba(0,0,0,0.5)", offsetX: 5, offsetY: 5, blur: 5 }
      };
    } else if(newType === 'roundedRect') {
      comp = {
        id: Date.now(),
        type: 'roundedRect',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        cornerRadius: 10,
        fillStyle: 'rgb(0, 0, 0, 0.5)'
      };
    } else if(newType === 'starRating') {
      comp = {
        id: Date.now(),
        type: 'starRating',
        x: 0,
        y: 0,
        width: 550,
        ratings: [
          { label: "ES", rating: "{starRatings.ES}", color: "rgb(22 163 74)" },
          { label: "NOR", rating: "{starRatings.NOR}", color: "rgb(59 130 246)" },
          { label: "HARD", rating: "{starRatings.HARD}", color: "rgb(249 115 22)" },
          { label: "EX", rating: "{starRatings.EXP}", color: "rgb(220 38 38)" },
          { label: "EXP", rating: "{starRatings.EXP}", color: "rgb(126 34 206)" }
        ],
        defaultWidth: 100,
        specialWidth: 120,
        height: 50,
        defaultSpacing: 110,
        specialSpacing: 130
      };
    } else {
      return;
    }
    addComponent(comp);
  };

  // Add new deletion function:
  const handleDeleteComponent = (id: number) => {
    setConfig({
      ...config,
      components: config.components.filter(comp => comp.id !== id)
    });
    setSelectedComponentId(null);
  };

  return (
    <div className="flex h-screen" onMouseUp={handleMouseUp}>
      {/* Canvas Area */}
      <div className="flex-1 p-4" onMouseMove={handleMouseMove}>
        <h1 className="text-4xl font-bold mb-6">Visual Editor</h1>
        <div className="mb-4 flex items-center gap-2">
          <select value={newType} onChange={e => setNewType(e.target.value)} className="p-2 border rounded bg-white text-black">
            <option value="text">text</option>
            <option value="image">image</option>
            <option value="roundedRect">roundedRect</option>
            <option value="starRating">starRating</option>
          </select>
          <button onClick={handleAddComponent} className="border border-green-500 bg-green-500/10 px-3 py-1">
            Add Component
          </button>
          <button onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `${config.configName}.json`;
            a.click();
          }} className="border border-blue-500 bg-blue-500/10 px-3 py-1">
            Export Config
          </button>
        </div>
        <div
          ref={cardRef}
          className="relative mt-4 border bg-gray-200"
          style={{
            width: config.width * scale,
            height: config.height * scale,
            borderRadius: config.cardCornerRadius * scale,
            overflow: 'hidden'
          }}
        >
          {/* New Background Layer */}
          <div className="absolute inset-0" style={{
            borderRadius: config.cardCornerRadius * scale,
            opacity: 0.3,
            zIndex: 0,
            ...(config.background?.type === 'color' && config.background.color ? { backgroundColor: config.background.color } : {}),
            ...(config.background?.type === 'cover' && config.background.srcField ? {
              backgroundImage: `url(${getNestedValue(fetchedData, config.background.srcField) || placeholder})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {})
          }} />
          {/* Grid Lines */}
          {Array.from({ length: Math.floor(config.width / gridStep) + 1 }).map((_, i) => {
            const pos = i * gridStep;
            const isMiddle = Math.abs(pos - config.width / 2) < gridStep / 2;
            return (
              <div key={`v${i}`}
                style={{
                  position: 'absolute',
                  left: pos * scale,
                  top: 0,
                  height: '100%',
                  width: isMiddle ? 2 : 1,
                  background: isMiddle ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)',
                  zIndex: 1
                }} />
            );
          })}
          {Array.from({ length: Math.floor(config.height / gridStep) + 1 }).map((_, i) => {
            const pos = i * gridStep;
            const isMiddle = Math.abs(pos - config.height / 2) < gridStep / 2;
            return (
              <div key={`h${i}`}
                style={{
                  position: 'absolute',
                  top: pos * scale,
                  left: 0,
                  width: '100%',
                  height: isMiddle ? 2 : 1,
                  background: isMiddle ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)',
                  zIndex: 1
                }} />
            );
          })}
          {/* Render Components */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            {config.components.map(comp => (
              <div
                key={comp.id}
                onMouseDown={e => handleMouseDown(e, comp)}
                style={{
                  position: 'absolute',
                  left: comp.x * scale,
                  top: comp.y * scale,
                  width: comp.width * scale,
                  height: comp.height * scale,
                  border: comp.id === selectedComponentId ? '2px solid blue' : '1px solid gray',
                  padding: '2px',
                  cursor: 'move'
                }}
              >
                {comp.type === 'text' && (
                  <div className="no-move" style={{ 
                    color: comp.fillStyle || 'black', 
                    font: comp.font || '24px sans-serif',
                    textAlign: comp.textAlign,
                    maxWidth: comp.maxWidth,
                    height: '100%',     
                    display: 'flex',    
                    alignItems: 'center'
                  }}>
                    {comp.text}
                  </div>
                )}
                {comp.type === 'image' && (
                  <img src={placeholder} alt="" className="no-move" style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: comp.cornerRadius ? comp.cornerRadius * scale : 0
                  }} />
                )}
                {comp.type === 'roundedRect' && (
                  <div className="no-move" style={{ width: '100%', height: '100%', background: comp.fillStyle, borderRadius: comp.cornerRadius ? comp.cornerRadius * scale : 0 }} />
                )}
                {comp.type === 'starRating' && (
                  (() => {
                    let currentX = 0;
                    const ratings = comp.ratings ?? [{
                      label: "Placeholder",
                      rating: "",
                      color: "gray",
                      defaultWidth: 100,
                      specialWidth: 120,
                      defaultSpacing: 110,
                      specialSpacing: 130
                    }];
                    return (
                      <div className="no-move" style={{ position: 'relative', width: comp.width * scale, height: (comp.height || 50) * scale }}>
                        {ratings.map((ratingObj: any, i: number) => {
                          let ratingValue = ratingObj.rating;
                          if (fetchedData && ratingValue && ratingValue.startsWith('{') && ratingValue.endsWith('}')) {
                            const key = ratingValue.slice(1, -1);
                            ratingValue = getNestedValue(fetchedData, key);
                          }
                          if (ratingValue !== undefined && ratingValue !== null && ratingValue !== '') {
                            const rectWidth = (ratingValue === 'Unranked' || ratingValue === 'Qualified' 
                              ? (comp.specialWidth || 120) 
                              : (comp.defaultWidth || 100)) * scale;
                            const starElement = (
                              <div key={i} style={{
                                position: 'absolute',
                                left: currentX,
                                top: 0,
                                width: rectWidth,
                                height: (comp.height || 50) * scale,
                                background: ratingObj.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              className='rounded-md no-move'
                              >
                                <span className="no-move" style={{ color: 'white', font: comp.font || 'bold 20px sans-serif' }}>
                                  {ratingObj.label}★
                                </span>
                              </div>
                            );
                            currentX += ((ratingValue === 'Unranked' || ratingValue === 'Qualified')
                              ? (comp.specialSpacing || 130)
                              : (comp.defaultSpacing || 110)) * scale;
                            return starElement;
                          }
                          return null;
                        })}
                      </div>
                    );
                  })()
                )}
                {/* Render resize handle if selected */}
                {comp.id === selectedComponentId && (
                  <div
                    onMouseDown={e => handleResizeMouseDown(e, comp)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      width: 10,
                      height: 10,
                      backgroundColor: 'blue',
                      cursor: 'nwse-resize',
                      zIndex: 3
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Properties Panel */}
      <div className="w-80 p-4 border-l border-gray-400">
        <h2 className="text-xl font-bold mb-4">Properties</h2>
        {selectedComponentId !== null ? (
          <>
            {config.components.filter(comp => comp.id === selectedComponentId).map(comp => (
              <div key={comp.id}>
                <div className="mb-4">
                  <label className="block mb-1">Type</label>
                  <select value={comp.type} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, type: e.target.value, ...(e.target.value==="image" && { srcField: c.srcField || "images/placeholder.jpg" }) } : c) })} className="w-full p-2 border rounded">
                    <option value="text">text</option>
                    <option value="image">image</option>
                    <option value="roundedRect">roundedRect</option>
                    <option value="starRating">starRating</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-1">X</label>
                  <input type="number" value={comp.x} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, x: parseInt(e.target.value) } : c) })} className="w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Y</label>
                  <input type='number' value={comp.y} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, y: parseInt(e.target.value) } : c) })} className="w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Width</label>
                  <input type="number" value={comp.width} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, width: parseInt(e.target.value) } : c) })} className="w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Height</label>
                  <input type="number" value={comp.height} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, height: parseInt(e.target.value) } : c) })} className="w-full p-2 border rounded" />
                </div>
                {comp.type === 'text' && (
                  <>
                    <div className="mb-4">
                      <label className="block mb-1">Text</label>
                      <input type="text" value={comp.text} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, text: e.target.value } : c) })} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Max Width</label>
                      <input type="number" value={comp.maxWidth} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, maxWidth: parseInt(e.target.value) } : c) })} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Fill Style</label>
                      <input type="text" value={comp.fillStyle || ''} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, fillStyle: e.target.value } : c) })} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Font</label>
                      <input type="text" value={comp.font} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, font: e.target.value } : c) })} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Text Align</label>
                      <select
                      value={comp.textAlign || 'left'}
                      onChange={e => setConfig({
                        ...config,
                        components: config.components.map(c =>
                        c.id === comp.id ? { ...c, textAlign: e.target.value } : c
                        )
                      })}
                      className="w-full p-2 border rounded"
                      >
                      <option value="left">left</option>
                      <option value="center">center</option>
                      <option value="right">right</option>
                      </select>
                    </div>
                  </>
                )}
                {comp.type === 'image' && (
                  <>
                    <div className="mb-4">
                      <label className="block mb-1">Source URL</label>
                      <input type="text" value={comp.srcField} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, srcField: e.target.value } : c) })} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Corner Radius</label>
                      <input type="number" value={comp.cornerRadius || 0} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, cornerRadius: parseInt(e.target.value) } : c) })} className="w-full p-2 border rounded" />
                    </div>
                  </>
                )}
                {comp.type === 'roundedRect' && (
                  <>
                    <div className="mb-4">
                      <label className="block mb-1">Fill Style</label>
                      <input type="text" value={comp.fillStyle} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, fillStyle: e.target.value } : c) })} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Corner Radius</label>
                      <input type="number" value={comp.cornerRadius || 0} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, cornerRadius: parseInt(e.target.value) } : c) })} className="w-full p-2 border rounded" />
                    </div>
                  </>
                )}
                {comp.type === 'starRating' && (
                  <>
                    <div className="mb-4">
                      <label className="block mb-1">Default Width</label>
                      <input type="text" value={comp.defaultWidth} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, defaultWidth: e.target.value } : c) })} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Special Width</label>
                      <input type="number" value={comp.specialWidth} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, specialWidth: parseInt(e.target.value) } : c) })} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Height</label>
                      <input type="number" value={comp.height} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, height: parseInt(e.target.value) } : c) })} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Default Spacing</label>
                      <input type="number" value={comp.defaultSpacing} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, defaultSpacing: parseInt(e.target.value) } : c) })} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Special Spacing</label>
                      <input type="number" value={comp.specialSpacing} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, specialSpacing: parseInt(e.target.value) } : c) })} className="w-full p-2 border rounded" />
                    </div>
                  </>
                )}
                <Button 
                  onClick={() => handleDeleteComponent(comp.id)}
                  className="mt-4 w-full border-red-500 bg-red-500/10"
                >
                  Delete Component
                </Button>
              </div>
            ))}

          </>
        ) : (
          <p>No component selected.</p>
        )}
      </div>
    </div>
  );
};

export default VisualEditor;
