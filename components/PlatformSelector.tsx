import React from 'react';
import { Platform } from '../types';
import { Smartphone, Apple, AppWindow } from 'lucide-react';

interface PlatformSelectorProps {
  selected: Platform;
  onSelect: (p: Platform) => void;
  disabled: boolean;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <button
        onClick={() => onSelect(Platform.IOS)}
        disabled={disabled}
        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
          selected === Platform.IOS
            ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/20'
            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:bg-slate-750'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Apple className="w-6 h-6" />
        <span className="font-semibold">iOS</span>
      </button>

      <button
        onClick={() => onSelect(Platform.ANDROID)}
        disabled={disabled}
        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
          selected === Platform.ANDROID
            ? 'border-green-500 bg-green-500/10 text-green-400 shadow-lg shadow-green-500/20'
            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:bg-slate-750'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Smartphone className="w-6 h-6" />
        <span className="font-semibold">Android</span>
      </button>

      <button
        onClick={() => onSelect(Platform.MINI_PROGRAM)}
        disabled={disabled}
        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
          selected === Platform.MINI_PROGRAM
            ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-lg shadow-orange-500/20'
            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:bg-slate-750'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <AppWindow className="w-6 h-6" />
        <span className="font-semibold">小程序</span>
      </button>
    </div>
  );
};

export default PlatformSelector;