import React, { useState, useRef, useCallback } from 'react';

const formatTime = (time) => {
  if (isNaN(time) || time === null || time === undefined) return '0:00';
  const totalSeconds = Math.floor(time);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const TopScrubber = ({ appTime = 0, duration = 0, onSeek }) => {
  const barRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, percentage: 0, time: 0 });

  const calculateTimeFromClientX = useCallback(
    (clientX) => {
      if (!barRef.current || duration <= 0) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const percentage = rect.width > 0 ? offsetX / rect.width : 0;
      return percentage * duration;
    },
    [duration],
  );

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    const newTime = calculateTimeFromClientX(e.clientX);
    setIsDragging(true);
    setDragTime(newTime);
  };

  const handlePointerMove = (e) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percentage = rect.width > 0 ? (offsetX / rect.width) * 100 : 0;
    const targetTime = (percentage / 100) * (duration || 0);

    setHoverPosition({
      x: offsetX,
      percentage,
      time: targetTime,
    });

    if (isDragging) {
      setDragTime(targetTime);
    }
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      const finalTime = calculateTimeFromClientX(e.clientX);
      if (onSeek) {
        onSeek(finalTime);
      }
      setIsDragging(false);
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerCancel = (e) => {
    if (isDragging) {
      setIsDragging(false);
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTime = Math.min(duration, (isDragging ? dragTime : appTime) + 5);
      onSeek && onSeek(nextTime);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextTime = Math.max(0, (isDragging ? dragTime : appTime) - 5);
      onSeek && onSeek(nextTime);
    }
  };

  const activeTime = isDragging ? dragTime : appTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (activeTime / duration) * 100)) : 0;

  // Clamp tooltip badge position so it never overflows left or right edges of the screen
  const tooltipLeft = isDragging ? progressPercent : hoverPosition.percentage;
  const clampedTooltipLeft = Math.min(94, Math.max(6, tooltipLeft));

  return (
    <div
      ref={barRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => {
        if (!isDragging) setIsHovering(false);
      }}
      onKeyDown={handleKeyDown}
      role="slider"
      tabIndex={0}
      aria-label="Seek recitation timeline tape"
      aria-valuemin={0}
      aria-valuemax={duration || 100}
      aria-valuenow={Math.round(activeTime)}
      className="group absolute -top-3.5 left-0 right-0 h-7 cursor-pointer select-none z-40 touch-none flex flex-col justify-end outline-none"
    >
      {/* Background track bar */}
      <div
        className={`w-full transition-all duration-150 relative ${
          isHovering || isDragging
            ? 'h-[5px] sm:h-[6px] bg-midnight-750'
            : 'h-[3px] bg-midnight-800/90'
        }`}
      >
        {/* Active progress fill */}
        <div
          className={`h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 relative transition-all ${
            isDragging ? 'duration-0' : 'duration-150'
          }`}
          style={{ width: `${progressPercent}%` }}
        >
          {/* Scrubber thumb circle */}
          <div
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-md shadow-indigo-950 ring-2 ring-indigo-500 transition-transform ${
              isHovering || isDragging ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
          />
        </div>

        {/* Hover / Drag Time Badge Tooltip */}
        {(isHovering || isDragging) && (
          <div
            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-midnight-850/95 border border-indigo-500/40 shadow-xl backdrop-blur text-[10px] font-mono font-semibold text-indigo-300 pointer-events-none whitespace-nowrap z-50 animate-slowfade flex items-center gap-1"
            style={{
              left: `${clampedTooltipLeft}%`,
            }}
          >
            <span>{formatTime(isDragging ? dragTime : hoverPosition.time)}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{formatTime(duration)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopScrubber;
