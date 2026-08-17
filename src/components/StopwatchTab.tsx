import React, { useEffect, useState } from 'react';
import { Flag, Pause, Play, RotateCcw, Timer } from 'lucide-react';
import type { StopwatchLap, StopwatchState } from '../types';
import { formatStopwatchMs } from '../utils/time';

interface StopwatchTabProps {
  stopwatch: StopwatchState;
  onUpdateStopwatch: (state: StopwatchState) => void;
}

export const StopwatchTab: React.FC<StopwatchTabProps> = ({ stopwatch, onUpdateStopwatch }) => {
  const [elapsed, setElapsed] = useState<number>(stopwatch.elapsedTime);

  useEffect(() => {
    let animationFrameId: number;

    if (stopwatch.isRunning && stopwatch.startTime) {
      const update = () => {
        const now = Date.now();
        const currentElapsed = stopwatch.elapsedTime + (now - (stopwatch.startTime || now));
        setElapsed(currentElapsed);
        animationFrameId = requestAnimationFrame(update);
      };
      animationFrameId = requestAnimationFrame(update);
    } else {
      setElapsed(stopwatch.elapsedTime);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [stopwatch.isRunning, stopwatch.startTime, stopwatch.elapsedTime]);

  const handleStart = () => {
    onUpdateStopwatch({
      ...stopwatch,
      isRunning: true,
      startTime: Date.now(),
    });
  };

  const handleStop = () => {
    const finalElapsed = elapsed;
    onUpdateStopwatch({
      ...stopwatch,
      isRunning: false,
      elapsedTime: finalElapsed,
      startTime: undefined,
    });
  };

  const handleReset = () => {
    setElapsed(0);
    onUpdateStopwatch({
      elapsedTime: 0,
      isRunning: false,
      startTime: undefined,
      laps: [],
    });
  };

  const handleLap = () => {
    const currentTotal = elapsed;
    const previousTotal = stopwatch.laps.length > 0 ? stopwatch.laps[0].totalTime : 0;
    const lapTime = currentTotal - previousTotal;

    const newLap: StopwatchLap = {
      id: stopwatch.laps.length + 1,
      lapTime,
      totalTime: currentTotal,
    };

    onUpdateStopwatch({
      ...stopwatch,
      laps: [newLap, ...stopwatch.laps],
    });
  };

  const { main, msFormatted } = formatStopwatchMs(elapsed);

  // Determine fastest & slowest laps if more than 1 lap
  let minLapTime = Infinity;
  let maxLapTime = -1;
  if (stopwatch.laps.length > 1) {
    stopwatch.laps.forEach((l) => {
      if (l.lapTime < minLapTime) minLapTime = l.lapTime;
      if (l.lapTime > maxLapTime) maxLapTime = l.lapTime;
    });
  }

  return (
    <div className="flex-1 flex flex-col p-3.5 space-y-3 justify-between">
      {/* Stopwatch Digital Display */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner my-1">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white drop-shadow">
            {main}
          </span>
          <span className="text-lg font-mono font-bold text-emerald-400">
            .{msFormatted}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-1">
          <Timer className="w-3 h-3 text-emerald-500" />
          {stopwatch.isRunning ? 'Active Timing' : 'Stopped'}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {stopwatch.isRunning ? (
          <>
            <button
              onClick={handleLap}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Flag className="w-4 h-4 text-emerald-400" /> Lap
            </button>
            <button
              onClick={handleStop}
              className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" /> Stop
            </button>
          </>
        ) : (
          <>
            {elapsed > 0 && (
              <button
                onClick={handleReset}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Reset Stopwatch"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleStart}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" /> {elapsed > 0 ? 'Resume' : 'Start Stopwatch'}
            </button>
          </>
        )}
      </div>

      {/* Laps List */}
      <div className="flex-1 flex flex-col min-h-[140px] max-h-[160px] bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
        <div className="px-3 py-1.5 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-[10px] font-semibold text-slate-400">
          <span className="w-10">Lap</span>
          <span className="flex-1 text-center">Split Time</span>
          <span className="w-16 text-right">Total</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 text-xs">
          {stopwatch.laps.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[11px] text-slate-500 italic p-3">
              Press "Lap" while running to record splits
            </div>
          ) : (
            stopwatch.laps.map((lap) => {
              const isFastest = lap.lapTime === minLapTime && stopwatch.laps.length > 1;
              const isSlowest = lap.lapTime === maxLapTime && stopwatch.laps.length > 1;
              const { main: splitMain, msFormatted: splitMs } = formatStopwatchMs(lap.lapTime);
              const { main: totMain } = formatStopwatchMs(lap.totalTime);

              return (
                <div
                  key={lap.id}
                  className={`px-3 py-1.5 flex items-center justify-between font-mono text-[11px] ${
                    isFastest
                      ? 'bg-emerald-500/10 text-emerald-300 font-semibold'
                      : isSlowest
                      ? 'bg-amber-500/10 text-amber-300 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="w-10 text-[10px] font-sans font-medium text-slate-400 flex items-center gap-1">
                    #{lap.id}
                    {isFastest && <span className="text-[9px] text-emerald-400 font-bold">MIN</span>}
                    {isSlowest && <span className="text-[9px] text-amber-400 font-bold">MAX</span>}
                  </span>
                  <span className="flex-1 text-center font-medium">
                    +{splitMain}.{splitMs}
                  </span>
                  <span className="w-16 text-right text-slate-400">{totMain}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
