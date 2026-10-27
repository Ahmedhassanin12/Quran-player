import React, { useState, useRef, useCallback, useEffect } from 'react';

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
  const draggingRef = useRef(false);

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeAppTime = Number.isFinite(appTime) && appTime > 0
    ? Math.min(appTime, safeDuration || appTime)
    : 0;

  // Drop any in-progress drag when track duration resets (surah change)
  useEffect(() => {
    draggingRef.current = false;
    setIsDragging(false);
    setDragTime(0);
    setIsHovering(false);
  }, [safeDuration]);

  const calculateTimeFromClientX = useCallback(
    (clientX) => {
      if (!barRef.current || safeDuration <= 0) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const percentage = rect.width > 0 ? offsetX / rect.width : 0;
      return percentage * safeDuration;
    },
    [safeDuration],
  );

  const updateHoverFromClientX = useCallback(
    (clientX) => {
      if (!barRef.current) return { offsetX: 0, percentage: 0, targetTime: 0 };
      const rect = barRef.current.getBoundingClientRect();
      const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const percentage = rect.width > 0 ? (offsetX / rect.width) * 100 : 0;
      const targetTime = (percentage / 100) * safeDuration;
      setHoverPosition({ x: offsetX, percentage, time: targetTime });
      return { offsetX, percentage, targetTime };
    },
    [safeDuration],
  );

  const beginDrag = (clientX) => {
    if (safeDuration <= 0) return;
    const newTime = calculateTimeFromClientX(clientX);
    draggingRef.current = true;
    setIsDragging(true);
    setDragTime(newTime);
    updateHoverFromClientX(clientX);
  };

  const moveDrag = (clientX) => {
    const { targetTime } = updateHoverFromClientX(clientX);
    if (draggingRef.current) {
      setDragTime(targetTime);
    }
  };

  const endDrag = (clientX) => {
    if (!draggingRef.current) return;
    const finalTime = calculateTimeFromClientX(clientX);
    draggingRef.current = false;
    setIsDragging(false);
    if (onSeek && safeDuration > 0) {
      onSeek(finalTime);
    }
  };

  const handlePointerDown = (e) => {
    if (safeDuration <= 0) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
    beginDrag(e.clientX);
  };

  const handlePointerMove = (e) => {
    moveDrag(e.clientX);
  };

  const handlePointerUp = (e) => {
    endDrag(e.clientX);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerCancel = (e) => {
    draggingRef.current = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // iOS Safari sometimes drops pointer events; mirror with touch*
  const handleTouchStart = (e) => {
    if (safeDuration <= 0 || !e.touches?.[0]) return;
    e.preventDefault();
    beginDrag(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!e.touches?.[0]) return;
    if (draggingRef.current) e.preventDefault();
    moveDrag(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches?.[0];
    if (touch) endDrag(touch.clientX);
    else {
      draggingRef.current = false;
      setIsDragging(false);
    }
  };

  const handleKeyDown = (e) => {
    if (safeDuration <= 0) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTime = Math.min(safeDuration, (isDragging ? dragTime : safeAppTime) + 5);
      onSeek && onSeek(nextTime);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextTime = Math.max(0, (isDragging ? dragTime : safeAppTime) - 5);
      onSeek && onSeek(nextTime);
    }
  };

  const activeTime = isDragging ? dragTime : safeAppTime;
  const progressPercent = safeDuration > 0
    ? Math.min(100, Math.max(0, (activeTime / safeDuration) * 100))
    : 0;

  const tooltipLeft = isDragging ? progressPercent : hoverPosition.percentage;
  const clampedTooltipLeft = Math.min(94, Math.max(6, tooltipLeft));

  return (
    <div
      ref={barRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handlePointerCancel}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => {
        if (!draggingRef.current) setIsHovering(false);
      }}
      onKeyDown={handleKeyDown}
      role="slider"
      tabIndex={0}
      aria-label="Seek recitation timeline tape"
      aria-valuemin={0}
      aria-valuemax={safeDuration || 100}
      aria-valuenow={Math.round(activeTime)}
      aria-disabled={safeDuration <= 0}
      className="group absolute -top-3.5 left-0 right-0 h-8 cursor-pointer select-none z-40 touch-none flex sm:hidden flex-col justify-end outline-none pb-4 sm:pb-0"
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {/* Background track bar */}
      <div
        className={`w-full relative ${
          isHovering || isDragging
            ? 'h-[5px] bg-midnight-750'
            : 'h-[3px] bg-midnight-800/90'
        }`}
      >
        {/* Active progress fill */}
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 relative"
          style={{
            width: `${progressPercent}%`,
            transition: isDragging ? 'none' : 'width 80ms linear',
          }}
        >
          {/* Scrubber thumb circle */}
          <div
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md shadow-indigo-950 ring-2 ring-indigo-500 ${
              isHovering || isDragging ? 'scale-100 opacity-100' : 'scale-75 opacity-90'
            }`}
          />
        </div>

        {/* Hover / Drag Time Badge Tooltip */}
        {(isHovering || isDragging) && safeDuration > 0 && (
          <div
            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-midnight-850/95 border border-indigo-500/40 shadow-xl backdrop-blur text-[10px] font-mono font-semibold text-indigo-300 pointer-events-none whitespace-nowrap z-50 flex items-center gap-1"
            style={{ left: `${clampedTooltipLeft}%` }}
          >
            <span>{formatTime(isDragging ? dragTime : hoverPosition.time)}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{formatTime(safeDuration)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopScrubber;
