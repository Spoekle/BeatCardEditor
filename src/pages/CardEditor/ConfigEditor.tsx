import React from 'react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '../Components/Button';

interface ConfigEditorProps {
  config: any;
  setConfig: (cfg: any) => void;
  componentsText: string;
  setComponentsText: (text: string) => void;
  addAlert: (msg: string, type: "error" | "success" | "alert") => void;
}

const ConfigEditor: React.FC<ConfigEditorProps> = ({ config, setConfig, componentsText, setComponentsText, addAlert }) => {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-6">Card Editor</h1>
      {/* ... General Settings ... */}
      <div className="mb-4">
        <Typography variant="subtitle1">Config Name</Typography>
        <TextField fullWidth value={config.configName} onChange={e => setConfig({ ...config, configName: e.target.value })} className="bg-white text-neutral-900 rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <Typography variant="subtitle1">Width</Typography>
          <TextField type="number" value={config.width} onChange={e => setConfig({ ...config, width: parseInt(e.target.value) })} className="bg-white text-neutral-900 rounded-lg"/>
        </div>
        <div>
          <Typography variant="subtitle1">Height</Typography>
          <TextField type="number" value={config.height} onChange={e => setConfig({ ...config, height: parseInt(e.target.value) })} className="bg-white text-neutral-900 rounded-lg"/>
        </div>
        <div>
          <Typography variant="subtitle1">Corner Radius</Typography>
          <TextField type="number" value={config.cardCornerRadius} onChange={e => setConfig({ ...config, cardCornerRadius: parseInt(e.target.value) })} className="bg-white text-neutral-900 rounded-lg"/>
        </div>
        <div className="col-span-1">
          <Typography variant="subtitle1">Background Type</Typography>
          <select
            value={config.background?.type || 'color'}
            onChange={e => {
              const newType = e.target.value;
              let newBg;
              if (newType === 'color') {
                newBg = { type: 'color', color: '#ffffff' };
              } else if (newType === 'cover') {
                newBg = { type: 'cover', srcField: 'versions.0.coverURL', blur: 10 };
              }
              setConfig({ ...config, background: newBg });
            }}
            className="bg-white text-neutral-900 rounded-lg p-2 w-full"
          >
            <option value="color">Color</option>
            <option value="cover">Cover Image</option>
          </select>
        </div>
        {config.background?.type === 'color' && (
          <div className="col-span-2">
            <Typography variant="subtitle1">Background Color</Typography>
            <TextField
              type="color"
              value={config.background.color}
              onChange={e =>
                setConfig({
                  ...config,
                  background: { type: 'color', color: e.target.value }
                })
              }
              className="bg-white w-24 text-neutral-900 rounded-lg"
            />
          </div>
        )}
        {config.background?.type === 'cover' && (
          <div className="col-span-2">
            <Typography variant="subtitle1">Background Image URL</Typography>
            <TextField
              type="text"
              fullWidth
              variant="outlined"
              value={config.background.srcField}
              onChange={e =>
                setConfig({
                  ...config,
                  background: { type: 'cover', srcField: e.target.value, blur: 10 }
                })
              }
              className="bg-white text-black rounded-lg"
            />
          </div>
        )}
        <div className="col-span-1">
          <Typography variant="subtitle1">Background Blur</Typography>
          <TextField
            type="number"
            value={config.background.blur}
            onChange={e => setConfig({ ...config, background: { ...config.background, blur: parseFloat(e.target.value) } })}
            className="bg-white text-neutral-900 rounded-lg"
          />
        </div>
      </div>
      {/* ... Background Settings and Components JSON Editor ... */}
      <div className="mb-4">
        <Typography variant="subtitle1" className="mb-2">Components (JSON array)</Typography>
        <TextField fullWidth multiline minRows={5} value={componentsText} onChange={e => setComponentsText(e.target.value)} variant="outlined" className="bg-white text-black" />
      </div>
      <Button onClick={() => {
        localStorage.setItem('cardConfig', JSON.stringify(config));
        addAlert('Card configuration saved!', 'success');
      }} className="border-green-500 bg-green-500/10">
        Save Config
      </Button>
    </div>
  );
};

export default ConfigEditor;
