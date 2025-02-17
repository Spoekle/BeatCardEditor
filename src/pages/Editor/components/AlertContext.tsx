import React, { createContext, useContext, useState, ReactNode } from 'react';
import Alert from './Alert';

interface AlertContextProps {
    addAlert: (message: string, type: 'error' | 'success' | 'alert') => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alerts, setAlerts] = useState<{ message: string; type: 'error' | 'success' | 'alert'; id: number }[]>([]);

    const addAlert = (message: string, type: 'error' | 'success' | 'alert') => {
        const id = Date.now();
        setAlerts((prevAlerts) => [...prevAlerts, { message, type, id }]);
        setTimeout(() => {
            setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
        }, 3000);
    };

    return (
        <AlertContext.Provider value={{ addAlert }}>
            {children}
            <div className="absolute top-24 right-4 space-y-2 overflow-hidden">
                {alerts.map((alert) => (
                    <Alert key={alert.id} message={alert.message} type={alert.type} onClose={() => {}} />
                ))}
            </div>
        </AlertContext.Provider>
    );
};