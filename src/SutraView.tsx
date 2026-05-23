import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Minus, RotateCw, ChevronDown, Play, Pause } from 'lucide-react';
import { SUTRAS } from './data';
import { AudioPlayer } from './AudioPlayer';

interface SutraViewProps {
  id: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  onSetParam: (val: number) => void;
  onBack: () => void;
  onChangeSutra: (id: string) => void;
}

export function SutraView({ id, count, onIncrement, onDecrement, onReset, onSetParam, onBack, onChangeSutra }: SutraViewProps) {
  const [tab, setTab] = useState<'text' | 'audio'>('text');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1.5);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Calculate daily count roughly (since we don't have historical daily context we use current total count here or mock it)
  // For the example we just show count.
  const [dailyTarget, setDailyTarget] = useState(() => {
    const saved = localStorage.getItem(`target-${id}`);
    return saved ? parseInt(saved, 10) : 27;
  });

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const newTarget = isNaN(val) ? 0 : Math.max(0, val);
    setDailyTarget(newTarget);
    localStorage.setItem(`target-${id}`, newTarget.toString());
  };

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let accumulatedScroll = 0;

    const scroll = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (isAutoScrolling) {
        // Multiply by scrollSpeed (default 1 to 10 range)
        // e.g. speed=5 -> 5 * 3 = 15 pixels per 100ms -> 150px per second
        const scrollAmount = (delta * scrollSpeed * 3) / 100;
        accumulatedScroll += scrollAmount;
        
        if (accumulatedScroll >= 1) {
          const pixelsToScroll = Math.floor(accumulatedScroll);
          
          if (scrollContainerRef.current && scrollContainerRef.current.scrollHeight > scrollContainerRef.current.clientHeight) {
             scrollContainerRef.current.scrollTop += pixelsToScroll;
          } else {
             window.scrollBy(0, pixelsToScroll);
          }
          accumulatedScroll -= pixelsToScroll;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    if (isAutoScrolling) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(scroll);
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isAutoScrolling, scrollSpeed]);

  // Find currently selected sutra
  const sutra = SUTRAS.find(s => s.id === id);

  if (!sutra) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p>Sutra not found.</p>
        <button onClick={onBack} className="mt-4 text-red-800 underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F3EFE3] overflow-x-hidden">
      
      {/* Top Tab Bar containing back button and tabs */}
      <div className="sticky top-0 z-10 w-full flex items-center bg-[#E8DEC7] p-2 sm:p-3 border-b border-[#DCD1BA] shadow-sm">
        <button
          onClick={onBack}
          className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full text-[#6a1515] hover:bg-[#F3EFE3] transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        
        <div className="flex-1 flex justify-center">
          <div className="flex bg-[#E8DEC7] border border-[#DCD1BA] rounded-xl p-1 shadow-inner h-12 w-full max-w-sm">
            <button
              onClick={() => setTab('text')}
              className={`flex-1 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${tab === 'text' ? 'bg-[#FDFBF2] text-[#8A1A1A] shadow-sm' : 'text-[#8c7462] hover:text-[#5c4a3d]'}`}
            >
              经文
            </button>
            <button
              onClick={() => setTab('audio')}
              className={`flex-1 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${tab === 'audio' ? 'bg-[#FDFBF2] text-[#8A1A1A] shadow-sm' : 'text-[#8c7462] hover:text-[#5c4a3d]'}`}
            >
              Audio Mode
            </button>
          </div>
        </div>
        <div className="w-10 flex-shrink-0" />
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 pt-4 pb-32">
        {tab === 'text' && (
          <div className="w-full flex flex-col h-full">
            
            {/* Header controls (Dropdown & Daily Count) */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center justify-between gap-2">
              <div className="flex-1 relative">
                <select
                  value={sutra.id}
                  onChange={(e) => onChangeSutra(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Select Sutra"
                >
                  {SUTRAS.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                <div className="bg-[#FAF6EC] border border-[#dccfb4] text-[#4a3f35] appearance-none rounded-full px-3 py-2 text-sm font-medium shadow-sm truncate w-full flex items-center justify-between pointer-events-none">
                  <span className="truncate">{sutra.title}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#8c7462] ml-1" />
                </div>
              </div>
              <button
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className={`flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-full shadow-sm border transition-colors ${isAutoScrolling ? 'bg-[#8A1A1A] text-white border-[#8A1A1A]' : 'bg-[#FAF6EC] text-[#8A1A1A] border-[#dccfb4] hover:bg-white'}`}
                aria-label="Toggle Auto Scroll"
              >
                {isAutoScrolling ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <div className="bg-[#FAF6EC] border border-[#dccfb4] text-[#6a1515] rounded-full pl-2 pr-1 py-1 text-sm font-medium shadow-sm flex-shrink-0 flex items-center gap-1 h-9">
                <span className="text-[#8c7462] hidden sm:inline">Daily:</span>
                <span className="font-bold whitespace-nowrap">{count} /</span>
                <input 
                  type="number"
                  value={dailyTarget || ''}
                  onChange={handleTargetChange}
                  className="w-10 sm:w-12 bg-white border border-[#E8DEC7] rounded-full text-[#8A1A1A] font-bold outline-none text-center shadow-inner py-0.5 focus:border-[#8A1A1A] focus:ring-1 focus:ring-[#8A1A1A] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>
            
            {isAutoScrolling && (
              <div className="flex items-center gap-3 bg-[#FAF6EC] border border-[#E8DEC7] px-4 py-2 rounded-full shadow-sm transition-all duration-300">
                <span className="text-xs font-bold text-[#8c7462] whitespace-nowrap">Speed</span>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="0.5" 
                  value={scrollSpeed} 
                  onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#dccfb4] rounded-lg appearance-none cursor-pointer accent-[#8A1A1A]"
                />
              </div>
            )}
            </div>

            {/* Content Area */}
            <div className="w-full bg-[#FAF6EC] rounded-2xl shadow-sm flex flex-col items-center border border-[#E8DEC7] overflow-hidden flex-1 min-h-[50vh]">
              <div 
                ref={scrollContainerRef}
                className="w-full flex-1 overflow-y-auto pb-32 pt-2"
                onPointerDown={() => {
                  if (isAutoScrolling) setIsAutoScrolling(false);
                }}
              >
                {sutra.images && sutra.images.length > 0 ? (
                  <div className="flex flex-col w-full -space-y-[30%] pt-[5%] pb-[10%]">
                    {sutra.images.map((imgSrc, index) => (
                      <img 
                        key={index} 
                        src={imgSrc} 
                        alt={`${sutra.title} page ${index + 1}`} 
                        className="w-full h-auto block filter contrast-[1.15] sepia-[0.3] mix-blend-multiply opacity-90 relative" 
                        style={{ zIndex: sutra.images.length - index }}
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <h2 className="text-2xl font-bold text-red-900 mb-6">{sutra.title}</h2>
                    <p className="max-w-xs text-sm text-[#8c7462]">
                      Recite this sutra with a sincere heart. Ensure your mind is clear.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Bar (Floating Counter) */}
            <div className="fixed bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-6 sm:gap-10 pointer-events-none">
              <div className="flex items-center gap-6 sm:gap-10 pointer-events-auto bg-[#F3EFE3]/80 p-2 rounded-full backdrop-blur-sm">
                <button
                  onClick={onDecrement}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF6EC] text-[#8c7462] hover:text-[#6a1515] hover:bg-white transition-all shadow-md border border-[#E8DEC7] active:scale-95"
                  aria-label="Decrement"
                >
                  <Minus className="h-6 w-6" strokeWidth={1.5} />
                </button>

                <button
                  onClick={onIncrement}
                  className="relative flex flex-col items-center justify-center h-28 w-28 rounded-full bg-[#8A1A1A] text-white hover:bg-[#7a0f0f] active:scale-95 transition-all shadow-xl shadow-red-900/20"
                  aria-label="Increment"
                >
                  <span className="text-4xl font-serif font-bold tracking-tight leading-none mt-2">{count}</span>
                  <span className="text-xs font-medium opacity-80 mt-1">Count</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Reset this counter?')) {
                      onReset();
                    }
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF6EC] text-[#8c7462] hover:text-[#6a1515] hover:bg-white transition-all shadow-md border border-[#E8DEC7] active:scale-95"
                  aria-label="Reset"
                >
                  <RotateCw className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

          </div>
        )}

        {tab === 'audio' && (
          <AudioPlayer title={sutra.title} />
        )}
      </div>
    </div>
  );
}
