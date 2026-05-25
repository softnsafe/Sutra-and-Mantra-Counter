import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, Upload, Music } from 'lucide-react';

interface AutoModeProps {
  onIncrementCount: (count: number) => void;
}

export function AutoMode({ onIncrementCount }: AutoModeProps) {
  const [audios, setAudios] = useState<(string | null)[]>([null, null, null, null]);
  const [names, setNames] = useState<string[]>(['Audio #1', 'Audio #2', 'Audio #3', 'Audio #4']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentLoop, setCurrentLoop] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const sequence = [
    { audioIndex: 0, times: 13 },
    { audioIndex: 1, times: 55 },
    { audioIndex: 0, times: 3 },
    { audioIndex: 2, times: 100 },
    { audioIndex: 0, times: 3 },
    { audioIndex: 3, times: 100 },
    { audioIndex: 0, times: 15 },
  ];

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudios(prev => {
        const next = [...prev];
        next[index] = url;
        return next;
      });
      setNames(prev => {
        const next = [...prev];
        next[index] = file.name;
        return next;
      });
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = 1.5;
    }
  }, [currentStep, isPlaying]);

  const playStep = () => {
    if (currentStep >= sequence.length) {
      setIsPlaying(false);
      return;
    }

    const step = sequence[currentStep];
    const src = audios[step.audioIndex];

    if (!src) {
      // Audio not uploaded, skip this step?
      setCurrentStep(s => s + 1);
      setCurrentLoop(0);
      return;
    }

    if (audioRef.current) {
      if (audioRef.current.src !== src) {
        audioRef.current.src = src;
      }
      audioRef.current.play().catch(console.error);
    }
  };

  const handleEnded = () => {
    const step = sequence[currentStep];
    
    // Auto increment logic maybe? Wait, should it count? 
    // The requirement says "play 13 times...". It didn't mention incrementing the sutra count for the app, but maybe we shouldn't unless specified.
    
    if (currentLoop + 1 < step.times) {
      setCurrentLoop(l => l + 1);
      if (audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
    } else {
      // Move to next step
      if (currentStep + 1 < sequence.length) {
        setCurrentStep(s => s + 1);
        setCurrentLoop(0);
      } else {
        // Finished everything
        setIsPlaying(false);
        setCurrentStep(0);
        setCurrentLoop(0);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      playStep();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentStep]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col items-center px-4 pt-12 pb-24 w-full max-w-md mx-auto">
      <div className="bg-[#E8DEC7] w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#DCD1BA]">
        <Music className="w-12 h-12 text-[#9A8462]" />
      </div>

      <h2 className="text-2xl font-serif font-bold text-[#6a1515] mb-4">Auto Mode Sequence</h2>
      <p className="text-sm text-[#8c7462] mb-8 text-center max-w-[280px]">
        Upload 4 audios to play the predefined sequence automatically (always at 1.5x speed).
      </p>

      <div className="w-full space-y-3 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 bg-[#FAF6EC] p-3 rounded-2xl shadow-sm border border-[#E8DEC7]">
            <div className="w-8 h-8 rounded-full bg-[#E8DEC7] flex items-center justify-center text-[#6a1515] font-bold shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-[#4a3f35] block truncate">
                {audios[i] ? names[i] : `Audio #${i + 1} (Not uploaded)`}
              </span>
            </div>
            <label className="shrink-0 cursor-pointer p-2 bg-white rounded-full text-[#8c7462] hover:text-[#5c1313] hover:bg-[#E8DEC7] transition-colors border border-[#DCD1BA]">
              <Upload className="w-4 h-4" />
              <input 
                type="file" 
                accept="audio/*" 
                className="hidden" 
                onChange={(e) => handleFileUpload(i, e)} 
              />
            </label>
          </div>
        ))}
      </div>

      <div className="bg-[#FAF6EC] rounded-3xl p-6 w-full shadow-md border border-[#E8DEC7] flex flex-col items-center">
        <div className="text-center mb-6">
          <div className="text-[#8c7462] text-sm font-bold mb-2">
            {isPlaying ? 'Playing Sequence' : (currentStep === 0 && currentLoop === 0 ? 'Ready to Start' : 'Paused')}
          </div>
          <div className="text-xl font-bold text-[#4a3f35] mb-2 px-4 whitespace-normal break-words">
            {sequence[currentStep] && (
              <>{names[sequence[currentStep].audioIndex]}</>
            )}
          </div>
          <div className="text-sm font-medium text-[#6a1515] mb-3 bg-[#E8DEC7] inline-block px-3 py-1 rounded-full border border-[#DCD1BA]">
            {sequence[currentStep] && (
              <>Step {currentStep + 1} (Audio #{sequence[currentStep].audioIndex + 1})</>
            )}
          </div>
          <div className="text-base text-[#8c7462] mt-1 font-bold">
            Play Count: {currentLoop + 1} of {sequence[currentStep]?.times || 0}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-20 h-20 flex items-center justify-center rounded-full bg-[#8A1A1A] hover:bg-[#6a1515] text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-2" />
            )}
          </button>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        onEnded={handleEnded}
        onCanPlay={(e) => {
          (e.target as HTMLAudioElement).playbackRate = 1.5;
        }}
        className="hidden" 
      />
    </div>
  );
}
