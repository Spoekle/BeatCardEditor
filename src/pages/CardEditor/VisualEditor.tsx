import React, { useRef, useEffect } from 'react';

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
      srcField: string;
      blur: number;
      rotation: number;
      color: string;
      gradient: { startColor: string; endColor: string; };
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
  const scale = 0.5;
  const gridStep = Math.min(config.width, config.height) / 10;
  const snap = (val: number, step: number) => Math.round(val / step) * step;

  const [newType, setNewType] = React.useState<string>('text');
  const [selectedComponentId, setSelectedComponentId] = React.useState<number | null>(null);
  const [draggingId, setDraggingId] = React.useState<number | null>(null);
  const [offset, setOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Helper to resolve image src from fetchedData without mutating config
  const resolveImageSrc = (comp: ComponentType): string => {
    if(fetchedData && fetchedData.versions && fetchedData.versions[0]?.coverURL) {
      return fetchedData.versions[0].coverURL;
    }
    return comp.srcField;
  };

  const handleMouseDown = (e: React.MouseEvent, comp: ComponentType) => {
    setSelectedComponentId(comp.id);
    setDraggingId(comp.id);
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setOffset({ x: e.clientX - rect.left - comp.x * scale, y: e.clientY - rect.top - comp.y * scale });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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
  };

  const handleAddComponent = () => {
    const comp: ComponentType = {
      id: Date.now(),
      type: newType,
      x: 0,
      y: 0,
      width: newType === 'image' ? 100 : 100,
      height: newType === 'image' ? 100 : 30,
      ...(newType === 'text' && { text: 'New Text' }),
      ...(newType === 'image' && { 
          srcField: "versions.0.coverURL",
          cornerRadius: 0,
          clip: true,
          shadow: { color: "rgba(0,0,0,0.5)", offsetX: 5, offsetY: 5, blur: 5 }
       })
    };
    addComponent(comp);
  };

  return (
    <div className="flex h-screen" onMouseUp={handleMouseUp}>
      {/* Canvas Area */}
      <div className="flex-1 p-4" onMouseMove={handleMouseMove}>
        <h1 className="text-2xl font-bold mb-4">Visual Editor</h1>
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
            borderRadius: config.cardCornerRadius * scale
          }}
        >
          {/* Draw square grid lines */}
          {Array.from({ length: Math.floor(config.width / gridStep) + 1 }).map((_, i) => {
            const left = i * gridStep * scale;
            return (
              <div key={`v${i}`}
                style={{
                  position: 'absolute',
                  left,
                  top: 0,
                  height: '100%',
                  width: 1,
                  background: 'rgba(0,0,0,0.2)'
                }} />
            );
          })}
          {Array.from({ length: Math.floor(config.height / gridStep) + 1 }).map((_, i) => {
            const top = i * gridStep * scale;
            return (
              <div key={`h${i}`}
                style={{
                  position: 'absolute',
                  top,
                  left: 0,
                  width: '100%',
                  height: 1,
                  background: 'rgba(0,0,0,0.2)'
                }} />
            );
          })}
          {/* Render Components */}
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
                <div style={{ color: 'black', fontSize: '12px' }}>
                  {comp.text}
                </div>
              )}
              {comp.type === 'image' && (
                <img src={resolveImageSrc(comp)} alt="" style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: comp.cornerRadius ? comp.cornerRadius * scale : 0
                }} />
              )}
              {comp.type === 'roundedRect' && (
                <div style={{ width: '100%', height: '100%', background: comp.fillStyle, borderRadius: comp.cornerRadius ? comp.cornerRadius * scale : 0 }} />
              )}
              {comp.type === 'starRating' && (
                <div style={{ display: 'flex' }}>
                  {comp.ratings.map((item: any, i: number) => (
                    <div key={i} style={{
                      width: (i === 0 ? comp.defaultWidth : comp.specialWidth) * scale,
                      height: comp.height * scale,
                      background: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: i < comp.ratings.length - 1 ? ((i === 0 ? comp.defaultSpacing : comp.specialSpacing) * scale * 0.2) : 0
                    }}>
                      <span style={{ color: 'white', fontSize: '10px' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Properties Panel */}
      <div className="w-80 p-4 border-l border-gray-400">
        <h2 className="text-xl font-bold mb-4">Properties</h2>
        {selectedComponentId !== null ? (
          <>
            {config.components.filter(comp => comp.id === selectedComponentId).map(comp => (
              <div key={comp.id}>
                {/* ...minimal property inputs... */}
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
                  <div className="mb-4">
                    <label className="block mb-1">Text</label>
                    <input type="text" value={comp.text} onChange={e => setConfig({ ...config, components: config.components.map(c => c.id === comp.id ? { ...c, text: e.target.value } : c) })} className="w-full p-2 border rounded" />
                  </div>
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
                {/* ...other type-specific properties */}
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
