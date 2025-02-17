import React from 'react';

interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className }) => {
    return (
        <button
            onClick={onClick}
            className={`border border-indigo-500 bg-indigo-500/10 hover:border-white hover:bg-white/10 cursor-pointer text-white font-bold py-2 px-4 rounded-lg transition duration-200 ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;