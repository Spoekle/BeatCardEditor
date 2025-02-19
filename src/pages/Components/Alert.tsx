import React, { useEffect } from 'react';

interface AlertProps {
    message: string;
    type: 'error' | 'success' | 'alert';
    onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getColor = () => {
        switch (type) {
            case 'error':
                return 'bg-red-500/10 border-red-500';
            case 'success':
                return 'bg-green-500/10 border-green-500';
            case 'alert':
                return 'bg-indigo-500/10 border-indigo-500';
            default:
                return '';
        }
    };

    return (
        <div className={`p-4 rounded text-white font-bold ${getColor()} rounded-lg border-2 text-white backdrop-blur-md ${getColor()} animate-fade-left`}>
            {message}
        </div>
    );
};

export default Alert;