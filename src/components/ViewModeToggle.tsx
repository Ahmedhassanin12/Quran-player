import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiList } from 'react-icons/fi';

export interface ViewModeToggleProps {
  viewMode?: 'grid' | 'list';
  onChange?: (mode: 'grid' | 'list') => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode = 'grid',
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t('common.viewMode')}
      className="flex p-0.5 rounded-lg bg-midnight-850/80 border border-midnight-700/60 shadow-sm"
    >
      <button
        type="button"
        onClick={() => onChange && onChange('grid')}
        aria-label={t('common.gridView')}
        aria-pressed={viewMode === 'grid'}
        title={t('common.gridView')}
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
        aria-label={t('common.listView')}
        aria-pressed={viewMode === 'list'}
        title={t('common.listView')}
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
};

export default ViewModeToggle;
