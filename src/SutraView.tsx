import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Minus, RotateCw, ChevronDown, Play, Pause, X, Trash2 } from 'lucide-react';
import { SUTRAS } from './data';
import { AudioPlayer } from './AudioPlayer';
import { AutoMode } from './AutoMode';

interface SavedRecord {
  date: string;
  type: '功課' | 'XFZ';
  sutra: string;
  count: number;
  label?: string;
}

const GONGKE_OPTIONS = ["大悲咒", "心經", "往生咒", "七佛", "功德寶山神咒", "禮佛", "楞嚴咒"];
const XFZ_OPTIONS = ["大悲咒", "心經", "往生咒", "七佛"];

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
  const [tab, setTab] = useState<'text' | 'audio' | 'auto'>('text');
  const [recordModalType, setRecordModalType] = useState<'功課' | 'XFZ' | null>(null);
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [recordSutra, setRecordSutra] = useState(id);
  const [recordCount, setRecordCount] = useState(count > 0 ? count : 1);
  const [recordLabel, setRecordLabel] = useState("");
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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

  const handleOpenRecordModal = (type: '功課' | 'XFZ') => {
    setRecordDate(new Date().toISOString().split('T')[0]);
    const options = type === '功課' ? GONGKE_OPTIONS : XFZ_OPTIONS;
    const currentTitle = sutra?.title || "";
    setRecordSutra(options.includes(currentTitle) ? currentTitle : options[0]);
    setRecordCount(count > 0 ? count : 1);
    setRecordLabel("");
    setRecordModalType(type);
  };

  const handleSaveRecord = () => {
    if (!recordModalType) return;
    setSavedRecords(prev => {
      const currentLabel = recordLabel.trim();
      const existingRecordIndex = prev.findIndex(r => r.date === recordDate && r.type === recordModalType && r.sutra === recordSutra && (r.label || "") === currentLabel);
      if (existingRecordIndex >= 0) {
        const newRecords = [...prev];
        newRecords[existingRecordIndex] = { ...newRecords[existingRecordIndex], count: newRecords[existingRecordIndex].count + recordCount };
        return newRecords;
      }
      return [...prev, { date: recordDate, type: recordModalType, sutra: recordSutra, count: recordCount, label: currentLabel }];
    });
    // Do not close modal automatically so user can see the records at the bottom
  };

  const handleDeleteRecord = (date: string, type: '功課' | 'XFZ', sutra: string, label: string = "") => {
    setSavedRecords(prev => prev.filter(r => !(r.date === date && r.type === type && r.sutra === sutra && (r.label || "") === label)));
  };

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
      <div className="sticky top-0 z-10 w-full flex flex-col items-center bg-[#E8DEC7] p-2 sm:p-3 border-b border-[#DCD1BA] shadow-sm">
        <div className="w-full flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full text-[#6a1515] hover:bg-[#F3EFE3] transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          <div className="flex-1 flex justify-center px-2">
            <div className="flex bg-[#E8DEC7] border border-[#DCD1BA] rounded-xl p-1 shadow-inner h-12 w-full max-w-md">
              <button
                onClick={() => setTab('text')}
                className={`flex-1 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${tab === 'text' ? 'bg-[#FDFBF2] text-[#8A1A1A] shadow-sm' : 'text-[#8c7462] hover:text-[#5c4a3d]'}`}
              >
                經文
              </button>
              <button
                onClick={() => setTab('audio')}
                className={`flex-1 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${tab === 'audio' ? 'bg-[#FDFBF2] text-[#8A1A1A] shadow-sm' : 'text-[#8c7462] hover:text-[#5c4a3d]'}`}
              >
                Audio Mode
              </button>
              <button
                onClick={() => setTab('auto')}
                className={`flex-1 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${tab === 'auto' ? 'bg-[#FDFBF2] text-[#8A1A1A] shadow-sm' : 'text-[#8c7462] hover:text-[#5c4a3d]'}`}
              >
                Auto Mode
              </button>
            </div>
          </div>
          <div className="w-10 flex-shrink-0" />
        </div>

        <div className="w-full flex justify-center mt-3 mb-1">
          <div className="flex gap-4">
            <button
              onClick={() => handleOpenRecordModal('功課')}
              className="px-5 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors border bg-[#FAF6EC] text-[#8A1A1A] border-[#dccfb4] hover:bg-white"
            >
              功課
            </button>
            <button
              onClick={() => handleOpenRecordModal('XFZ')}
              className="px-5 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors border bg-[#FAF6EC] text-[#8A1A1A] border-[#dccfb4] hover:bg-white"
            >
              XFZ
            </button>
          </div>
        </div>
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
                  <div className="flex flex-col w-full pt-[5%] pb-[10%]">
                    {sutra.images.map((imgSrc, index) => (
                      <img 
                        key={index} 
                        src={imgSrc || undefined} 
                        alt={`${sutra.title} page ${index + 1}`} 
                        className="w-full h-auto block filter contrast-[1.15] sepia-[0.3] mix-blend-multiply opacity-90 relative" 
                        style={{ 
                          zIndex: sutra.images.length - index,
                          marginTop: index > 0 
                            ? (['sutra2', 'sutra3', 'sutra6'].includes(sutra.id) ? '-25%' : '-30%') 
                            : '0'
                        }}
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
                  onClick={() => setShowResetConfirm(true)}
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

        {tab === 'auto' && (
          <AutoMode onIncrementCount={() => onIncrement()} />
        )}

        {/* Saved Records Section removed from here */}
      </div>

      {/* Record Modal */}
      {recordModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-[#F8F4E6] w-full max-w-[340px] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setRecordModalType(null)}
              className="absolute right-5 top-5 text-[#4a3f35] hover:text-black transition-colors"
            >
              <X className="h-6 w-6" strokeWidth={1.5} />
            </button>
            
            <h2 className="text-2xl font-bold text-[#5c1313] mb-6">記錄{recordModalType}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#7a6659] mb-1.5">日期</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full bg-transparent border border-[#dcb5b5] rounded-xl px-4 py-3 text-[#4a3f35] font-medium outline-none focus:border-[#8A1A1A] focus:ring-1 focus:ring-[#8A1A1A] block appearance-none transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-[#7a6659] mb-1.5">經文名稱</label>
                <div className="relative">
                  <select 
                    value={recordSutra}
                    onChange={(e) => setRecordSutra(e.target.value)}
                    className="w-full bg-transparent border border-[#dcb5b5] rounded-xl px-4 py-3 text-[#4a3f35] font-medium outline-none focus:border-[#8A1A1A] focus:ring-1 focus:ring-[#8A1A1A] appearance-none transition-colors"
                  >
                    {(recordModalType === '功課' ? GONGKE_OPTIONS : XFZ_OPTIONS).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7a6659] pointer-events-none" />
                </div>
              </div>

              <div>
                 <label className="block text-sm text-[#7a6659] mb-1.5">Label (標籤)</label>
                 <input 
                    type="text" 
                    value={recordLabel}
                    onChange={(e) => setRecordLabel(e.target.value)}
                    placeholder="例如: 1"
                    className="w-full bg-transparent border border-[#dcb5b5] rounded-xl px-4 py-3 text-[#4a3f35] font-medium outline-none focus:border-[#8A1A1A] focus:ring-1 focus:ring-[#8A1A1A] transition-colors"
                  />
              </div>

              <div>
                 <label className="block text-sm text-[#7a6659] mb-1.5">遍數</label>
                 <input 
                    type="number" 
                    min="1"
                    value={recordCount || ''}
                    onChange={(e) => setRecordCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent border border-[#dcb5b5] rounded-xl px-4 py-3 text-[#4a3f35] font-medium outline-none focus:border-[#8A1A1A] focus:ring-1 focus:ring-[#8A1A1A] transition-colors"
                  />
              </div>
            </div>

            <button 
              onClick={handleSaveRecord}
              className="w-full bg-[#5D100F] text-white text-[15px] font-bold py-3.5 rounded-full mt-8 hover:bg-[#4a0808] transition-colors shadow-lg active:scale-[0.98]"
            >
              保存記錄
            </button>

            {/* Display relevant saved records here */}
            {savedRecords.filter(r => r.type === recordModalType).length > 0 && (
              <div className="mt-8 border-t border-[#E8DEC7] pt-6">
                <h3 className="text-[15px] font-bold text-[#8c7462] mb-4">{recordModalType}記錄</h3>
                <div className="space-y-2.5">
                  {savedRecords.filter(r => r.type === recordModalType).map((r, i) => (
                    <div key={i} className="flex justify-between items-center bg-[#FAF6EC] rounded-xl p-3 shadow-sm border border-[#E8DEC7]">
                      <div>
                        <div className="text-[11px] text-[#8c7462] font-medium mb-0.5">{r.date}</div>
                        <div className="font-bold text-[#4a3f35] text-sm">
                          {r.sutra}
                          {r.label ? <span className="ml-2 text-xs bg-[#E8DEC7] px-1.5 py-0.5 rounded text-[#5c4a3d]">Label: {r.label}</span> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-black text-[#8A1A1A]">
                          {r.count}
                        </div>
                        <button
                          onClick={() => handleDeleteRecord(r.date, r.type, r.sutra, r.label)}
                          className="p-1.5 text-[#dcb5b5] hover:text-[#8A1A1A] transition-colors rounded-full hover:bg-[#E8DEC7]"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-[#F8F4E6] w-full max-w-[320px] rounded-[24px] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowResetConfirm(false)}
              className="absolute top-4 right-4 p-2 text-[#8c7462] hover:text-[#5c1313] transition-colors rounded-full hover:bg-[#E8DEC7]"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
            <h2 className="text-xl font-bold text-[#5c1313] mb-4 mt-2">提示</h2>
            <p className="text-[#5c4a3d] text-base mb-8">確定要重置這個計數器嗎？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-[#5c4a3d] bg-[#E8DEC7] hover:bg-[#DCD1BA] transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onReset();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-[#8A1A1A] hover:bg-[#5D100F] transition-colors shadow-md"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
