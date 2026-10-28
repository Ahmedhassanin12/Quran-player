import React, { useRef } from 'react';
import {
  BsFillVolumeUpFill,
  BsFillVolumeDownFill,
  BsFillVolumeMuteFill,
} from 'react-icons/bs';

export interface VolumeBarProps {
  value?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setVolume: (vol: number) => void;
}

const VolumeBar: React.FC<VolumeBarProps> = ({ value = 0.8, onChange, setVolume }) => {
  const prevVolumeRef = useRef<number>(0.8);

  const toggleMute = () => {
    if (value > 0) {
      prevVolumeRef.current = value;
      setVolume(0);
    } else {
      setVolume(prevVolumeRef.current || 0.8);
    }
  };

  const percentage = Math.min(100, Math.max(0, value * 100));

  return (
    <div className="hidden lg:flex items-center space-x-2.5 min-w-[130px] justify-end select-none">
      <button
        type="button"
        onClick={toggleMute}
        aria-label={value === 0 ? 'Unmute volume' : 'Mute volume'}
        className="text-slate-300 hover:text-indigo-400 transition-colors p-1"
      >
        {value === 0 && <BsFillVolumeMuteFill size={20} />}
        {value > 0 && value < 0.5 && <BsFillVolumeDownFill size={20} />}
        {value >= 0.5 && <BsFillVolumeUpFill size={20} />}
      </button>

      <div className="relative w-24 flex items-center group py-2">
        <div className="w-full h-1.5 bg-midnight-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 group-hover:bg-indigo-400 transition-all rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <input
          type="range"
          step="0.01"
          value={value}
          min="0"
          max="1"
          onChange={onChange}
          aria-label="Volume level"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default VolumeBar;
