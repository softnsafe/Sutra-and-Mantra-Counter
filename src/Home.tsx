import React, { useState } from 'react';
import { ChevronRight, RefreshCw, X } from 'lucide-react';
import { SUTRAS } from './data';

interface HomeProps {
  counters: Record<string, number>;
  onNavigate: (view: { type: 'sutra'; id: string }) => void;
  onResetAll: () => void;
}

export function Home({ counters, onNavigate, onResetAll }: HomeProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirmReset = () => {
    onResetAll();
    setShowConfirmModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F3EFE3] pb-12">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#E8DEC7] px-4 py-4 text-[#6a1515] border-b border-[#DCD1BA] shadow-sm">
        <h1 className="text-xl font-bold tracking-wider font-serif">佛教經文</h1>
        <button
          onClick={() => setShowConfirmModal(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF6EC] hover:bg-white text-[#6a1515] transition-colors border border-[#DCD1BA] shadow-sm"
          aria-label="Reset all counters"
          title="重置所有"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </header>

      <main className="mx-auto max-w-3xl pt-2 pb-12">
        <ul className="flex flex-col gap-3 px-4 pt-4">
          {SUTRAS.map((sutra) => (
            <li key={sutra.id}>
              <button
                onClick={() => onNavigate({ type: 'sutra', id: sutra.id })}
                className="flex w-full items-center justify-between px-5 py-4 rounded-2xl bg-[#FAF6EC] shadow-sm border border-[#E8DEC7] hover:bg-white transition-colors active:scale-[0.99] active:shadow-inner text-left"
              >
                <span className="text-base text-[#4a3f35] font-medium leading-snug pr-4">{sutra.title}</span>
                <div className="flex items-center gap-3 shrink-0">
                  {counters[sutra.id] > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1 text-sm font-bold text-[#8A1A1A] border border-[#E8DEC7] min-w-[2.5rem] shadow-sm">
                      {counters[sutra.id]}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-[#DCD1BA]" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-[#F8F4E6] w-full max-w-[320px] rounded-[24px] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-2 text-[#8c7462] hover:text-[#5c1313] transition-colors rounded-full hover:bg-[#E8DEC7]"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
            <h2 className="text-xl font-bold text-[#5c1313] mb-4 mt-2">提示</h2>
            <p className="text-[#5c4a3d] text-base mb-8">確定要重置所有計數器嗎？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-[#5c4a3d] bg-[#E8DEC7] hover:bg-[#DCD1BA] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReset}
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
