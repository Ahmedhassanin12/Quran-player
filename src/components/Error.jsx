import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const Error = ({ message = 'Unable to connect to the Quran audio service', onRetry }) => (
  <div className="w-full min-h-[300px] flex flex-col justify-center items-center py-12 px-4 text-center select-none">
    <div className="w-14 h-14 rounded-2xl bg-midnight-850 border border-midnight-700 flex items-center justify-center text-indigo-400 mb-4 shadow-lg">
      <FiAlertCircle size={28} />
    </div>

    <h3 className="font-semibold text-lg text-slate-100 max-w-md">
      {message}
    </h3>

    <p className="text-sm text-slate-400 font-arabic mt-1.5">
      يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى
    </p>

    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
      >
        <FiRefreshCw size={14} />
        <span>Try Again</span>
      </button>
    )}
  </div>
);

export default Error;
