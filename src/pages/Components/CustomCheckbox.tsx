import React from 'react';

interface CustomCheckboxProps {
    checked: boolean;
    onChange: () => void;
    label: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onChange, label }) => {
    return (
        <label className="flex items-center cursor-pointer font-bold text-white mb-4 select-none">
            <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
            <span className={`flex items-center justify-center px-4 py-4 border-2 rounded-lg transition-colors duration-200 hover:border-white ${checked ? 'bg-indigo-500 border-white' : 'bg-transparent border-indigo-500'}`}>
                <span className="text-sm">{label}</span>
            </span>
        </label>
    );
};

export default CustomCheckbox;