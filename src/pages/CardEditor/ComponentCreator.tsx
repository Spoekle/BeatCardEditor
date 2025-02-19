import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '../Components/Button';

// Helper function to extract nested data by path
const getNestedData = (data: any, path: string): any =>
	path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), data);

interface ComponentCreatorProps {
    beatsaverId: string;
    setBeatsaverId: React.Dispatch<React.SetStateAction<string>>;
    fetchedData: any;
    fetchBeatsaverData: () => Promise<void>;
    componentToken: string;
    setComponentToken: React.Dispatch<React.SetStateAction<string>>;
    addComponent: (component: any) => void;
    insertToken: (token: string) => void;
  }

const ComponentCreator: React.FC<ComponentCreatorProps> = ({
  beatsaverId, setBeatsaverId, fetchedData, fetchBeatsaverData, addComponent
}) => {
  // Local states for new component creation
  const [newComponentType, setNewComponentType] = useState<string>('text');
  const [newComponentText, setNewComponentText] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<string>('');

  // Token selector functions (for text components only)
  const renderTopLevelOptions = (data: any) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.keys(data).map(key => (
          <Button key={key} onClick={() => setSelectedToken(`{${key}}`)} className="border-gray-500 bg-gray-500/10">
            {`{${key}}`}
          </Button>
        ))}
      </div>
    );
  };

  const renderSubtokenOptions = (data: any, currentPath: string) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
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
  };

  let selectedNestedData: any = null, currentTokenPath = '';
  if (selectedToken && fetchedData) {
    currentTokenPath = selectedToken.replace(/{|}/g, '');
    selectedNestedData = getNestedData(fetchedData, currentTokenPath);
  }

  // Construct new component based on type
  const handleAddComponent = () => {
    let component: any;
    if(newComponentType === 'text'){
      component = {
        id: Date.now(), // added unique id
        type: 'text',
        x: 0,
        y: 0,
        text: selectedToken || newComponentText || '{data.example}',
        font: '24px sans-serif',
        fillStyle: 'white'
      };
    } else if(newComponentType === 'image'){
      component = {
        id: Date.now(), // added unique id
        type: 'image',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        srcField: '',
        cornerRadius: 0, // added rounded corner property
        clip: true,
        shadow: { color: 'rgba(0,0,0,0.5)', offsetX: 5, offsetY: 5, blur: 5 }
      };
    } else if(newComponentType === 'roundedRect'){
      component = {
        id: Date.now(), // added unique id
        type: 'roundedRect',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        cornerRadius: 10,
        fillStyle: 'transparent',
        backgroundColor: 'transparent'
      };
    } else if(newComponentType === 'starRating'){
      component = {
        id: Date.now(), // added unique id
        type: 'starRating',
        x: 0,
        y: 0,
        ratings: [
          { "label": "ES", "rating": "{starRatings.ES}", "color": "rgb(22 163 74)" },
          { "label": "NOR", "rating": "{starRatings.NOR}", "color": "rgb(59 130 246)" },
          { "label": "HARD", "rating": "{starRatings.HARD}", "color": "rgb(249 115 22)" },
          { "label": "EXP", "rating": "{starRatings.EXP}", "color": "rgb(220 38 38)" },
          { "label": "EXP_PLUS", "rating": "{starRatings.EXP_PLUS}", "color": "rgb(126 34 206)" }
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

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Component Creator</h1>
      <div className="mb-4">
        <Typography variant="subtitle1">Beatsaver ID</Typography>
        <TextField 
          fullWidth 
          value={beatsaverId} 
          onChange={e => setBeatsaverId(e.target.value)} 
          placeholder="Enter Beatsaver ID" 
          className="bg-white text-neutral-900 rounded-lg" 
        />
        <Button onClick={fetchBeatsaverData} className="mt-2 border-blue-500 bg-blue-500/10">
          Fetch Data
        </Button>
      </div>
      {fetchedData && (
        <div className="mb-4">
          <Typography variant="subtitle1">Fetched Data Preview:</Typography>
          <pre className="bg-blue-500/20 border-dashed border-white border-2 text-white font-bold py-3 px-6 rounded-lg overflow-y-auto max-h-[30vh]">
            {JSON.stringify(fetchedData, null, 2)}
          </pre>
        </div>
      )}
      {/* Component Type Selection */}
      <div className="mb-4">
        <Typography variant="subtitle1">Component Type</Typography>
        <select
          value={newComponentType}
          onChange={(e) => setNewComponentType(e.target.value)}
          className="w-full p-2 rounded bg-white text-neutral-900"
        >
          <option value="text">text</option>
          <option value="image">image</option>
          <option value="starRating">starRating</option>
          <option value="roundedRect">roundedRect</option>
        </select>
      </div>
      {/* For text type, show token selector */}
      {newComponentType === 'text' && fetchedData && (
        <div className="mb-4">
          {!selectedToken ? (
            <>
              <Typography variant="caption">Select a token from top-level:</Typography>
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
          <TextField 
            fullWidth 
            value={newComponentText || selectedToken} 
            onChange={e => setNewComponentText(e.target.value)} 
            placeholder="Enter component text" 
            className="bg-white text-neutral-900 rounded-lg mt-2" 
          />
        </div>
      )}
      <Button onClick={handleAddComponent} className="border-green-500 bg-green-500/10">
        Add Component
      </Button>
    </div>
  );
};

export default ComponentCreator;
