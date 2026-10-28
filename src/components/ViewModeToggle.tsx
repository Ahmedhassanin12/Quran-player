import React from 'react';
import { FiGrid, FiList } from 'react-icons/fi';

export interface ViewModeToggleProps {
  viewMode?: 'grid' | 'list';
  onChange?: (mode: 'grid' | 'list') => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode = 'grid',
  onChange,
}) => (
  <div
    role="group"
    aria-label="View layout switcher"
    className="flex p-0.5 rounded-lg bg-midnight-850/80 border border-midnight-700/60 shadow-sm"
  >
    <button
      type="button"
      onClick={() => onChange && onChange('grid')}
      aria-label="Grid layout"
      aria-pressed={viewMode === 'grid'}
      title="Grid layout"
      className={`p-1.5 rounded-md transition-colors ${
        viewMode === 'grid'
          ? 'bg-midnight-750 text-white shadow-sm'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      <FiGrid size={15} />
    </button>
    <button
      type="button"
      onClick={() => onChange && onChange('list')}
      aria-label="List layout"
      aria-pressed={viewMode === 'list'}
      title="List layout"
      className={`p-1.5 rounded-md transition-colors ${
        viewMode === 'list'
          ? 'bg-midnight-750 text-white shadow-sm'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      <FiList size={15} />
    </button>
  </div>
);

export default ViewModeToggle;
