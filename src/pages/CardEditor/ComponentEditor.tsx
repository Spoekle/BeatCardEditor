import React from 'react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '../Components/Button';

// Helper: extract nested data by path
const getNestedData = (data: any, path: string): any =>
  path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), data);

// Add helper functions for color conversion
const hexToRgba = (hex: string, alpha: number) => {
  return `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${alpha})`;
};

const extractHex = (rgba: string | undefined) => {
  if (!rgba) return '#000000';
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return '#000000';
};

const extractAlpha = (rgba: string | undefined) => {
  if (!rgba) return 1;
  const match = rgba.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*(\d?\.?\d+)\)/);
  return match ? parseFloat(match[1]) : 1;
};

// Extend props to include addComponent
interface ComponentEditorProps {
  config: any;
  selectedComponentIndex: number | null;
  setSelectedComponentIndex: (i: number | null) => void;
  updateSelectedComponent: (key: string, value: any) => void;
  deleteComponentAtIndex: (index: number) => void;
  fetchedData?: any;
  insertToken: (token: string) => void;
  moveComponent: (from: number, to: number) => void;
  addComponent: (component: any) => void; // new prop from creator
}

const ComponentEditor: React.FC<ComponentEditorProps> = ({
  config,
  selectedComponentIndex,
  setSelectedComponentIndex,
  updateSelectedComponent,
  deleteComponentAtIndex,
  fetchedData,
  moveComponent,
  addComponent
}) => {
  // ----- New state and functions for component creation -----
  const [newComponentType, setNewComponentType] = React.useState<string>('text');
  const [newComponentText, setNewComponentText] = React.useState<string>('');
  const [selectedToken, setSelectedToken] = React.useState<string>('');
  
  // Token selector functions (taken from ComponentCreator)
  const renderTopLevelOptions = (data: any) => (
    <div className="flex flex-wrap gap-2 my-2">
      {Object.keys(data).map(key => (
        <Button key={key} onClick={() => setSelectedToken(`{${key}}`)} className="border-gray-500 bg-gray-500/10">
          {`{${key}}`}
        </Button>
      ))}
    </div>
  );

  const renderSubtokenOptions = (data: any, currentPath: string) => (
    <div className="flex flex-wrap gap-2 my-2">
      {Object.keys(data).map(subkey => {
        const newToken = `{${currentPath}.${subkey}}`;
        return (
          <Button key={subkey} onClick={() => setSelectedToken(newToken)} className="border-gray-500 bg-gray-500/10">
            {newToken}
          </Button>
        );
      })}
    </div>
  );

  let selectedNestedData: any = null;
  if (selectedToken && fetchedData) {
    const currentTokenPath = selectedToken.replace(/{|}/g, '');
    selectedNestedData = getNestedData(fetchedData, currentTokenPath);
  }

  const handleAddComponent = () => {
    let component: any;
    if(newComponentType === 'text'){
      component = {
        id: Date.now(),
        type: 'text',
        x: 0,
        y: 0,
        text: selectedToken || newComponentText || '{data.example}',
        font: '24px sans-serif',
        fillStyle: 'white'
      };
    } else if(newComponentType === 'image'){
      component = {
        id: Date.now(),
        type: 'image',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        srcField: 'versions.0.coverURL',
        cornerRadius: 0,
        clip: true,
        shadow: { color: 'rgba(0,0,0,0.5)', offsetX: 5, offsetY: 5, blur: 5 }
      };
    } else if(newComponentType === 'roundedRect'){
      component = {
        id: Date.now(),
        type: 'roundedRect',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        cornerRadius: 10,
        fillStyle: 'transparent'
      };
    } else if(newComponentType === 'starRating'){
      component = {
        id: Date.now(),
        type: 'starRating',
        x: 0,
        y: 0,
        ratings: [
          { label: "ES", rating: "{starRatings.ES}", color: "rgb(22 163 74)" },
          { label: "NOR", rating: "{starRatings.NOR}", color: "rgb(59 130 246)" },
          { label: "HARD", rating: "{starRatings.HARD}", color: "rgb(249 115 22)" },
          { label: "EX", rating: "{starRatings.EX}", color: "rgb(220 38 38)" },
          { label: "EXP", rating: "{starRatings.EXP}", color: "rgb(126 34 206)" }
        ],
        defaultWidth: 100,
        specialWidth: 120,
        height: 50,
        defaultSpacing: 110,
        specialSpacing: 130
      };
    }
    addComponent(component);
    setNewComponentText('');
    setSelectedToken('');
  };
  // ----- End new creation code -----

  // Local state for token selection and drag indexes
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);

  // Updated drag handlers with smooth transition and no duplicate rendering
  const handleDragStart = (index: number, event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', index.toString());
    setDraggingIndex(index);
    setDragOverIndex(index);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index: number, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);
    moveComponent(fromIndex, index);
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Component Editor</h1>
      {/* New Component Creator Section */}
      {selectedComponentIndex === null && (
        <div className="mb-8 p-4 border border-gray-600 rounded-lg">
          <Typography variant="h6" className="mb-4">Add New Component</Typography>
          <div className="mb-4">
            <Typography variant="caption">Component Type</Typography>
            <select
              value={newComponentType}
              onChange={e => setNewComponentType(e.target.value)}
              className="w-full p-2 rounded bg-white text-neutral-900"
            >
              <option value="text">text</option>
              <option value="image">image</option>
              <option value="roundedRect">roundedRect</option>
              <option value="starRating">starRating</option>
            </select>
          </div>
          {newComponentType === 'text' && fetchedData && (
            <div className="mb-4">
              {!selectedToken ? (
                <>
                  <Typography variant="caption">Select a token:</Typography>
                  {renderTopLevelOptions(fetchedData)}
                </>
              ) : (
                <>
                  <Typography variant="subtitle1" className="mb-2">Selected Token: {selectedToken}</Typography>
                  {selectedNestedData && typeof selectedNestedData === 'object' && (
                    <>
                      <Typography variant="caption">Subtokens for {selectedToken}:</Typography>
                      {renderSubtokenOptions(selectedNestedData, selectedToken.replace(/{|}/g, ''))}
                    </>
                  )}
                </>
              )}
              <TextField 
                fullWidth 
                value={newComponentText || selectedToken} 
                onChange={e => setNewComponentText(e.target.value)} 
                placeholder="Enter text for the component" 
                className="bg-white text-neutral-900 rounded-lg" 
              />
            </div>
          )}
          <Button onClick={handleAddComponent} className="border-green-500 bg-green-500/10">
            Add Component
          </Button>
        </div>
      )}
      {/* Existing Components List and Editor */}
      {selectedComponentIndex === null ? (
        <>
          <Typography variant="subtitle1" className="mb-2">
            Drag and drop to reorder components:
          </Typography>
          <div className="flex flex-col gap-2">
            {config.components.map((comp: any, index: number) => {
              let details = '';
              if(comp.type === 'text'){
                details = comp.text ? comp.text.slice(0, 20) + '...' : '';
              } else if(comp.type === 'image'){
                details = `(${comp.width}x${comp.height})`;
              } else if(comp.type === 'roundedRect'){
                details = `(${comp.width}x${comp.height}, r=${comp.cornerRadius})`;
              } else if(comp.type === 'starRating'){
                details = comp.ratings ? `(${comp.ratings.length} ratings)` : '';
              }
              return (
                <div
                  key={index}
                  className="flex items-center justify-between bg-indigo-500/30 p-2 rounded-lg cursor-move transition-all duration-300"
                  style={{
                    border: dragOverIndex === index ? '2px dashed #60A5FA' : 'none',
                    opacity: draggingIndex === index ? 0.5 : 1
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(index, e)}
                  onDragOver={(e) => handleDragOver(index, e)}
                  onDrop={(e) => handleDrop(index, e)}
                  onDragEnd={handleDragEnd}
                >
                  <Typography>{`${index + 1}: ${comp.type} ${details && '- ' + details}`}</Typography>
                  <div className="flex gap-2">
                    <Button onClick={() => setSelectedComponentIndex(index)} className="border-blue-500 bg-blue-500/10">
                      Edit
                    </Button>
                    <Button onClick={() => deleteComponentAtIndex(index)} className="border-red-500 bg-red-500/10">
                      Delete
                    </Button>
                  </div>
                </div>
             );
            })}
          </div>
        </>
      ) : (
        <>
          <Button onClick={() => { setSelectedComponentIndex(null); setSelectedToken(''); }} className="mb-4 border-gray-500 bg-gray-500/10">
            Back to List
          </Button>
          <Typography variant="subtitle1" className="mb-2">
            {`Editing component [${selectedComponentIndex}] (${config.components[selectedComponentIndex].type})`}
          </Typography>
          <Button onClick={() => { deleteComponentAtIndex(selectedComponentIndex); setSelectedComponentIndex(null); }} className="mb-4 border-red-500 bg-red-500/10">
            Delete Component
          </Button>
          <div className="mb-4">
            <Typography variant="caption">Type</Typography>
            <select
              value={config.components[selectedComponentIndex].type}
              onChange={(e) => updateSelectedComponent('type', e.target.value)}
              className="w-full p-2 rounded bg-white text-neutral-900"
            >
              <option value="text">text</option>
              <option value="image">image</option>
              <option value="starRating">starRating</option>
              <option value="roundedRect">roundedRect</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="caption">X</Typography>
              <TextField
                type="number"
                fullWidth
                value={config.components[selectedComponentIndex].x}
                onChange={e => updateSelectedComponent('x', parseInt(e.target.value))}
                className="bg-white text-neutral-900 rounded-lg"
              />
            </div>
            <div>
              <Typography variant="caption">Y</Typography>
              <TextField
                type="number"
                fullWidth
                value={config.components[selectedComponentIndex].y}
                onChange={e => updateSelectedComponent('y', parseInt(e.target.value))}
                className="bg-white text-neutral-900 rounded-lg"
              />
            </div>
          </div>
          {config.components[selectedComponentIndex].type === 'text' && (
            <>
              <div className="mb-4">
                <Typography variant="caption">Text</Typography>
                <TextField
                  fullWidth
                  value={config.components[selectedComponentIndex].text}
                  onChange={e => updateSelectedComponent('text', e.target.value)}
                  className="bg-white text-neutral-900 rounded-lg"
                />
                {fetchedData && (
                  <div className="mt-2">
                    {!selectedToken ? (
                      <>
                        <Typography variant="caption">Select a token:</Typography>
                        {renderTopLevelOptions(fetchedData)}
                      </>
                    ) : (
                      <>
                        <Typography variant="subtitle1">Selected Token: {selectedToken}</Typography>
                        <Button onClick={() => setSelectedToken('')} className="mt-2 border-red-500 bg-red-500/10">
                          Reset Token
                        </Button>
                        {selectedNestedData && typeof selectedNestedData === 'object' && (
                          <>
                            <Typography variant="caption" className="mt-2">
                              Subtokens of {selectedToken}:
                            </Typography>
                            {renderSubtokenOptions(selectedNestedData, selectedToken.replace(/{|}/g, ''))}
                          </>
                        )}
                      </>
                    )}
                    <Button onClick={() => updateSelectedComponent('text', selectedToken)} className="mt-2 border-green-500 bg-green-500/10">
                      Insert Token
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
          {config.components[selectedComponentIndex].type === 'roundedRect' && (
            <>
              <div className="mb-4">
                <Typography variant="caption">Width</Typography>
                <TextField
                  type="number"
                  fullWidth
                  value={config.components[selectedComponentIndex].width || ''}
                  onChange={e => updateSelectedComponent('width', parseInt(e.target.value))}
                  className="bg-white text-neutral-900 rounded-lg"
                  placeholder="Width"
                />
              </div>
              <div className="mb-4">
                <Typography variant="caption">Height</Typography>
                <TextField
                  type="number"
                  fullWidth
                  value={config.components[selectedComponentIndex].height || ''}
                  onChange={e => updateSelectedComponent('height', parseInt(e.target.value))}
                  className="bg-white text-neutral-900 rounded-lg"
                  placeholder="Height"
                />
              </div>
              <div className="mb-4">
                <Typography variant="caption">Corner Radius</Typography>
                <TextField
                  type="number"
                  fullWidth
                  value={config.components[selectedComponentIndex].cornerRadius || ''}
                  onChange={e => updateSelectedComponent('cornerRadius', parseInt(e.target.value))}
                  className="bg-white text-neutral-900 rounded-lg"
                  placeholder="Corner Radius"
                />
              </div>
              {/* Updated fillStyle to use a color picker with alpha */}
              <div className="mb-4">
                <Typography variant="caption">Fill Style</Typography>
                <input
                  type="color"
                  value={extractHex(config.components[selectedComponentIndex].fillStyle)}
                  onChange={(e) => {
                    const newHex = e.target.value;
                    const alpha = extractAlpha(config.components[selectedComponentIndex].fillStyle) || 1;
                    updateSelectedComponent('fillStyle', hexToRgba(newHex, alpha));
                  }}
                  className="w-full p-2 rounded-lg"
                />
                <Typography variant="caption">Alpha</Typography>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={extractAlpha(config.components[selectedComponentIndex].fillStyle) || 1}
                  onChange={(e) => {
                    const newAlpha = parseFloat(e.target.value);
                    const newHex = extractHex(config.components[selectedComponentIndex].fillStyle);
                    updateSelectedComponent('fillStyle', hexToRgba(newHex, newAlpha));
                  }}
                  className="w-full"
                />
              </div>
            </>
          )}
          {config.components[selectedComponentIndex].type === 'image' && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Typography variant="caption">Width</Typography>
                  <TextField
                    type="number"
                    fullWidth
                    value={config.components[selectedComponentIndex].width || ''}
                    onChange={e => updateSelectedComponent('width', parseInt(e.target.value))}
                    className="bg-white text-neutral-900 rounded-lg"
                    placeholder="Width"
                  />
                </div>
                <div>
                  <Typography variant="caption">Height</Typography>
                  <TextField
                    type="number"
                    fullWidth
                    value={config.components[selectedComponentIndex].height || ''}
                    onChange={e => updateSelectedComponent('height', parseInt(e.target.value))}
                    className="bg-white text-neutral-900 rounded-lg"
                    placeholder="Height"
                  />
                </div>
              </div>
              <div className="mb-4">
                <Typography variant="caption">Src Field</Typography>
                <TextField
                  fullWidth
                  value={config.components[selectedComponentIndex].srcField || ''}
                  onChange={e => updateSelectedComponent('srcField', e.target.value)}
                  className="bg-white text-neutral-900 rounded-lg"
                  placeholder="e.g. versions.0.coverURL"
                />
              </div>
              <div className="mb-4">
                <Typography variant="caption">Clip</Typography>
                <select
                  value={config.components[selectedComponentIndex].clip ? 'true' : 'false'}
                  onChange={e => updateSelectedComponent('clip', e.target.value === 'true')}
                  className="w-full p-2 rounded bg-white text-neutral-900"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>
              {/* New input for image rounded corner */}
              <div className="mb-4">
                <Typography variant="caption">Corner Radius</Typography>
                <TextField
                  type="number"
                  fullWidth
                  value={config.components[selectedComponentIndex].cornerRadius || 0}
                  onChange={e => updateSelectedComponent('cornerRadius', parseInt(e.target.value))}
                  className="bg-white text-neutral-900 rounded-lg"
                  placeholder="Corner Radius"
                />
              </div>
              {/* Updated shadow color to use a color picker with alpha */}
              <div className="mb-4">
                <Typography variant="caption">Shadow Color</Typography>
                <input
                  type="color"
                  value={extractHex(config.components[selectedComponentIndex].shadow?.color)}
                  onChange={(e) => {
                    const newHex = e.target.value;
                    const newAlpha = extractAlpha(config.components[selectedComponentIndex].shadow?.color);
                    updateSelectedComponent('shadow', { ...config.components[selectedComponentIndex].shadow, color: hexToRgba(newHex, newAlpha) });
                  }}
                  className="w-full p-2 rounded-lg"
                />
                <Typography variant="caption">Alpha</Typography>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={extractAlpha(config.components[selectedComponentIndex].shadow?.color)}
                  onChange={(e) => {
                    const alpha = parseFloat(e.target.value);
                    const newHex = extractHex(config.components[selectedComponentIndex].shadow?.color);
                    updateSelectedComponent('shadow', { ...config.components[selectedComponentIndex].shadow, color: hexToRgba(newHex, alpha) });
                  }}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <Typography variant="caption">Shadow OffsetX</Typography>
                  <TextField
                    type="number"
                    fullWidth
                    value={(config.components[selectedComponentIndex].shadow && config.components[selectedComponentIndex].shadow.offsetX) || ''}
                    onChange={e => updateSelectedComponent('shadow', { ...config.components[selectedComponentIndex].shadow, offsetX: parseInt(e.target.value) })}
                    className="bg-white text-neutral-900 rounded-lg"
                    placeholder="OffsetX"
                  />
                </div>
                <div>
                  <Typography variant="caption">Shadow OffsetY</Typography>
                  <TextField
                    type="number"
                    fullWidth
                    value={(config.components[selectedComponentIndex].shadow && config.components[selectedComponentIndex].shadow.offsetY) || ''}
                    onChange={e => updateSelectedComponent('shadow', { ...config.components[selectedComponentIndex].shadow, offsetY: parseInt(e.target.value) })}
                    className="bg-white text-neutral-900 rounded-lg"
                    placeholder="OffsetY"
                  />
                </div>
                <div>
                  <Typography variant="caption">Shadow Blur</Typography>
                  <TextField
                    type="number"
                    fullWidth
                    value={(config.components[selectedComponentIndex].shadow && config.components[selectedComponentIndex].shadow.blur) || ''}
                    onChange={e => updateSelectedComponent('shadow', { ...config.components[selectedComponentIndex].shadow, blur: parseInt(e.target.value) })}
                    className="bg-white text-neutral-900 rounded-lg"
                    placeholder="Blur"
                  />
                </div>
              </div>
            </>
          )}
          {selectedComponentIndex !== null && config.components[selectedComponentIndex].type === 'starRating' && (
            <>
              <div className="mb-4">
                <Typography variant="caption">Default Width</Typography>
                <TextField
                  type="number"
                  fullWidth
                  value={config.components[selectedComponentIndex].defaultWidth || ''}
                  onChange={e => updateSelectedComponent('defaultWidth', parseInt(e.target.value))}
                  className="bg-white text-neutral-900 rounded-lg"
                  placeholder="e.g. 100"
                />
              </div>
              <div className="mb-4">
                <Typography variant="caption">Special Width</Typography>
                <TextField
                  type="number"
                  fullWidth
                  value={config.components[selectedComponentIndex].specialWidth || ''}
                  onChange={e => updateSelectedComponent('specialWidth', parseInt(e.target.value))}
                  className="bg-white text-neutral-900 rounded-lg"
                  placeholder="e.g. 120"
                />
              </div>
              <div className="mb-4">
                <Typography variant="caption">Default Spacing</Typography>
                <TextField
                  type="number"
                  fullWidth
                  value={config.components[selectedComponentIndex].defaultSpacing || ''}
                  onChange={e => updateSelectedComponent('defaultSpacing', parseInt(e.target.value))}
                  className="bg-white text-neutral-900 rounded-lg"
                  placeholder="e.g. 110"
                />
              </div>
              <div className="mb-4">
                <Typography variant="caption">Special Spacing</Typography>
                <TextField
                  type="number"
                  fullWidth
                  value={config.components[selectedComponentIndex].specialSpacing || ''}
                  onChange={e => updateSelectedComponent('specialSpacing', parseInt(e.target.value))}
                  className="bg-white text-neutral-900 rounded-lg"
                  placeholder="e.g. 130"
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ComponentEditor;
