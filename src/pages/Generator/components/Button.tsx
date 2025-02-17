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
            className={`border hover:border-white hover:bg-white/10 text-white cursor-pointer font-bold py-2 px-4 rounded-lg transition duration-200 ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;