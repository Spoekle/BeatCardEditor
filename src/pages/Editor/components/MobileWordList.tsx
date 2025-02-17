import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Button from './Button';
import './MobileWordList.css';
import type { Option } from '../../../helper/Passwords/GeneratePass';

interface MobileWordListProps {
  options: Option[];
  removeOption: (index: number) => void;
  updateWeight: (index: number, newWeight: number) => void;
}

const MobileWordList: React.FC<MobileWordListProps> = ({ options, removeOption, updateWeight }) => {
  const [isListOpen, setIsListOpen] = useState(false);
  const [bottomPosition, setBottomPosition] = useState('-bottom-8');

  const toggleList = () => {
    setIsListOpen(!isListOpen);
  };

  useEffect(() => {
    setBottomPosition(isListOpen ? 'bottom-0' : '-bottom-8');
  }, [isListOpen]);

  const increaseWeight = (index: number, currentWeight: number) => {
    if (currentWeight < 5) {
      updateWeight(index, currentWeight + 1);
    }
  };

  const decreaseWeight = (index: number, currentWeight: number) => {
    if (currentWeight > 1) {
      updateWeight(index, currentWeight - 1);
    }
  };

  return (
    <div className={`fixed z-20 ${bottomPosition} w-full block md:hidden transition-all duration-300`}>
      {isListOpen ? (
        <Button onClick={toggleList} className="w-full flex items-center justify-center rounded-t-lg rounded-b-none backdrop-blur-sm">
          <FaArrowDown /> Hide List <FaArrowDown />
        </Button>
      ) : (
        <Button onClick={toggleList} className="w-full flex items-center justify-center rounded-t-lg rounded-b-none backdrop-blur-sm">
          <FaArrowUp /> Word List <FaArrowUp />
        </Button>
      )}
      <div className={`relative flex flex-col w-full bg-neutral-900/70 backdrop-blur-sm rounded-lg p-4 overflow-hidden slide-up ${isListOpen ? 'open' : ''}`}>
        <h1 className="text-2xl font-bold mb-8 z-20">Current Words ({options.length}):</h1>
        <ul className="relative z-20 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full rounded-lg overflow-y-auto max-h-[50vh]">
          {options.length === 0 ? (
            <li className="text-center text-gray-500 border-2 border-dashed border-gray-500 p-4 bg-neutral-800/50 rounded-lg">
              No words added yet. Add some words to get started!
            </li>
          ) : (
            options.map((opt, index) => (
              <li key={index} className="flex w-full items-center justify-between p-2 bg-neutral-800 rounded-lg">
                <span>
                  {opt.option} <span className="text-sm text-gray-400">(w: {opt.weight})</span>
                </span>
                <div className="flex items-center">
                  <Button onClick={() => increaseWeight(index, opt.weight)} className="px-2 py-1">
                    <FaArrowUp />
                  </Button>
                  <Button onClick={() => decreaseWeight(index, opt.weight)} className="px-2 py-1 ml-1">
                    <FaArrowDown />
                  </Button>
                  <Button onClick={() => removeOption(index)} className="ml-4">
                    Remove
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default MobileWordList;