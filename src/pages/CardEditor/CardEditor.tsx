import { useState, useEffect } from 'react';
import Button from '../Components/Button';
import { useAlert, AlertProvider } from '../Components/AlertContext';
import ConfigEditor from './ConfigEditor';
import ComponentCreator from './ComponentCreator';
import ComponentEditor from './ComponentEditor';
import VisualEditor from './VisualEditor';

const CardEditor = () => {
  interface ComponentType {
    id: number;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    text?: string;
    font?: string;
    fillStyle?: string;
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
  
  const [config, setConfig] = useState<CardConfig>({
    configName: 'MyCardConfig',
    width: 900,
    height: 300,
    cardCornerRadius: 20,
    background: {
      type: 'color',
      color: '#ffffff'
    },
    components: []
  });
  
  const [componentsText, setComponentsText] = useState('[]');
  const { addAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<'config' | 'componentCreator' | 'componentEditor' | 'visualEditor'>('config');
  const [beatsaverId, setBeatsaverId] = useState('');
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [componentToken, setComponentToken] = useState('');
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(componentsText);
      setConfig(prev => ({ ...prev, components: parsed }));
    } catch (error) {
      // handle invalid JSON silently or alert if desired
    }
  }, [componentsText]);

  useEffect(() => {
    localStorage.setItem('cardConfig', JSON.stringify(config));
  }, [config]);

  const fetchBeatsaverData = async () => {
    try {
      const res = await fetch(`https://api.beatsaver.com/maps/id/${beatsaverId}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setFetchedData(data);
      addAlert('Data fetched successfully!', 'success');
    } catch (error) {
      addAlert('Beatsaver fetch error', 'error');
    }
  };

  const insertToken = (token: string) => {
    setComponentToken(prev => prev + `{${token}}`);
  };

  const addComponent = (component: any) => {
    const updatedComponents = [...config.components, component];
    setConfig({ ...config, components: updatedComponents });
    setComponentsText(JSON.stringify(updatedComponents, null, 2));
    addAlert('Component added!', 'success');
  };

  const updateSelectedComponent = (key: string, value: any) => {
    if (selectedComponentIndex === null) return;
    const updatedComponents = [...config.components];
    updatedComponents[selectedComponentIndex] = { ...updatedComponents[selectedComponentIndex], [key]: value };
    setConfig({ ...config, components: updatedComponents });
    setComponentsText(JSON.stringify(updatedComponents, null, 2));
  };

  const deleteComponentAtIndex = (index: number) => {
    const updatedComponents = config.components.filter((_: any, i: number) => i !== index);
    setConfig({ ...config, components: updatedComponents });
    setComponentsText(JSON.stringify(updatedComponents, null, 2));
    addAlert('Component deleted!', 'alert');
  };

  const moveComponent = (from: number, to: number) => {
    const newComponents = [...config.components];
    const [movedItem] = newComponents.splice(from, 1);
    newComponents.splice(to, 0, movedItem);
    setConfig({ ...config, components: newComponents });
    setComponentsText(JSON.stringify(newComponents, null, 2));
    addAlert('Component order changed!', 'success');
  };

  return (
    <div className="container mx-auto bg-neutral-900 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 justify-between p-6 overflow-y-auto">
        <div className="flex flex-col bg-neutral-800 shadow-lg items-center rounded-lg p-4">
          <div className="flex space-x-4 mb-6">
            <Button onClick={() => { setActiveTab('config'); setSelectedComponentIndex(null); }} className={activeTab === 'config' ? 'border-blue-500 bg-blue-500/10' : ''}>
              Config Editor
            </Button>
            <Button onClick={() => { setActiveTab('componentCreator'); setSelectedComponentIndex(null); }} className={activeTab === 'componentCreator' ? 'border-blue-500 bg-blue-500/10' : ''}>
              Component Creator
            </Button>
            <Button onClick={() => { setActiveTab('componentEditor'); setSelectedComponentIndex(null); }} className={activeTab === 'componentEditor' ? 'border-blue-500 bg-blue-500/10' : ''}>
              Component Editor
            </Button>
            <Button onClick={() => { setActiveTab('visualEditor'); setSelectedComponentIndex(null); }} className={activeTab === 'visualEditor' ? 'border-blue-500 bg-blue-500/10' : ''}>
              Visual Editor
            </Button>
          </div>
          {activeTab === 'config' && (
            <ConfigEditor config={config} setConfig={setConfig} componentsText={componentsText} setComponentsText={setComponentsText} addAlert={addAlert} />
          )}
          {activeTab === 'componentCreator' && (
            <ComponentCreator
              beatsaverId={beatsaverId} setBeatsaverId={setBeatsaverId}
              fetchedData={fetchedData} fetchBeatsaverData={fetchBeatsaverData}
              componentToken={componentToken} setComponentToken={setComponentToken}
              addComponent={addComponent} insertToken={insertToken}
            />
          )}
          {activeTab === 'componentEditor' && (
            <ComponentEditor
              config={config} selectedComponentIndex={selectedComponentIndex}
              setSelectedComponentIndex={setSelectedComponentIndex} updateSelectedComponent={updateSelectedComponent}
              deleteComponentAtIndex={deleteComponentAtIndex} // new prop
              fetchedData={fetchedData} insertToken={insertToken}
              moveComponent={moveComponent}
            />
          )} 
        </div>
        {activeTab !== 'visualEditor' && (
          <div className="bg-neutral-800 shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Preview JSON</h2>
            <pre className="bg-blue-500/20 border-dashed border-white border-2 text-white font-bold py-3 px-6 rounded-lg overflow-y-auto max-h-[75vh]">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        )}
      </div>
      {activeTab === 'visualEditor' && (
            <VisualEditor config={config} setConfig={setConfig} addComponent={addComponent} />
          )}
    </div>
  );
};

const App = () => (
  <AlertProvider>
    <CardEditor />
  </AlertProvider>
);

export default App;