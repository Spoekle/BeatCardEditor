import { useState, useEffect } from 'react';
import Button from './components/Button';
import { useAlert, AlertProvider } from './components/AlertContext';
import MapCardEditor from '../../components/MapCardEditor';

const Editor = () => {
    return (
        <div>
            <Button onClick={() => {/* some action */}}>
                Save
            </Button>
            <MapCardEditor />
        </div>
    );
};

const App = () => (
    <AlertProvider>
        <Editor />
    </AlertProvider>
);

export default App;