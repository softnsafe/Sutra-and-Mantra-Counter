import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, Upload, Music, Trash2, Plus, Square } from 'lucide-react';

interface AutoModeProps {
  onIncrementCount: (count: number) => void;
  onRecordHistory?: (title: string, count: number) => void;
}

const getInitialSequence = () => [
  { audioIndex: 0, times: 13, speed: 1.5 },
  { audioIndex: 1, times: 55, speed: 1.5 },
  { audioIndex: 0, times: 3, speed: 1.5 },
  { audioIndex: 2, times: 100, speed: 1.5 },
  { audioIndex: 0, times: 3, speed: 1.5 },
  { audioIndex: 3, times: 100, speed: 1.5 },
  { audioIndex: 0, times: 15, speed: 1.5 },
];

export function AutoMode({ onIncrementCount, onRecordHistory }: AutoModeProps) {
  const [audios, setAudios] = useState<(string | null)[]>([null, null, null, null]);
  const [names, setNames] = useState<string[]>(['大悲咒', '心经', '往生咒', '七佛灭罪真言']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentLoop, setCurrentLoop] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const [sequence, setSequence] = useState(getInitialSequence());

  const handleSequenceTimeChange = (index: number, newTimes: number) => {
    setSequence((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], times: newTimes };
      return next;
    });
  };

  const handleSequenceSpeedChange = (index: number, newSpeed: number) => {
    setSequence((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], speed: newSpeed };
      return next;
    });
  };

  const handleSequenceAudioChange = (index: number, newAudioIndex: number) => {
    setSequence((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], audioIndex: newAudioIndex };
      return next;
    });
  };

  const handleAddStep = () => {
    setSequence((prev) => [...prev, { audioIndex: 0, times: 1, speed: 1.5 }]);
  };

  const handleDeleteStep = (index: number) => {
    setSequence((prev) => prev.filter((_, i) => i !== index));
    if (currentStep >= sequence.length - 1) {
      setCurrentStep(0);
      setCurrentLoop(0);
    }
  };

  const handleAddAudioSlot = () => {
    setAudios(prev => [...prev, null]);
    setNames(prev => [...prev, `自定义音频 ${prev.length + 1}`]);
  };

  const handleDeleteAudioSlot = (index: number) => {
    setAudios(prev => prev.filter((_, i) => i !== index));
    setNames(prev => prev.filter((_, i) => i !== index));

    setSequence(prev => {
      let next = prev.filter(step => step.audioIndex !== index);
      next = next.map(step => {
        if (step.audioIndex > index) {
          return { ...step, audioIndex: step.audioIndex - 1 };
        }
        return step;
      });
      return next;
    });

    setCurrentStep(0);
    setCurrentLoop(0);
  };

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
    if (audioRef.current && sequence[currentStep]) {
      audioRef.current.playbackRate = sequence[currentStep].speed || 1.5;
    }
  }, [currentStep, isPlaying, sequence]);

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
      // Record complete step
      if (audios[step.audioIndex] && onRecordHistory) {
         onRecordHistory(names[step.audioIndex], step.times);
      }

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
        Upload audios to play the predefined sequence automatically. You can customize the speed for each step.
      </p>

      <div className="w-full space-y-3 mb-8">
        {audios.map((_, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#FAF6EC] p-3 rounded-2xl shadow-sm border border-[#E8DEC7]">
            <div className="w-8 h-8 rounded-full bg-[#E8DEC7] flex items-center justify-center text-[#6a1515] font-bold shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-[#4a3f35] block truncate">
                {audios[i] ? names[i] : `${names[i]} (Not uploaded)`}
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
            <button
              onClick={() => handleDeleteAudioSlot(i)}
              disabled={isPlaying}
              className="shrink-0 p-2 bg-white rounded-full text-[#dcb5b5] hover:text-[#8A1A1A] hover:bg-[#E8DEC7] transition-colors border border-[#DCD1BA] disabled:opacity-50"
              title="Delete Audio"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={handleAddAudioSlot}
          disabled={isPlaying}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-[#E8DEC7] hover:bg-[#DCD1BA] text-[#5c4a3d] font-bold py-2.5 rounded-xl border border-[#DCD1BA] border-dashed transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add New Audio
        </button>
      </div>

      <div className="w-full mb-8">
        <h3 className="text-lg font-bold text-[#4a3f35] mb-3 px-2">Edit Sequence</h3>
        <div className="space-y-2">
          {sequence.map((step, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#FDFBF2] p-3 rounded-xl border border-[#E8DEC7] shadow-sm gap-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-[#5c4a3d] font-bold shrink-0">Step {index + 1}:</span>
                <select 
                  value={step.audioIndex}
                  onChange={(e) => handleSequenceAudioChange(index, parseInt(e.target.value))}
                  disabled={isPlaying}
                  className="flex-1 sm:flex-none text-sm bg-white border border-[#DCD1BA] rounded-lg px-2 py-1 text-[#4a3f35] font-bold focus:outline-none focus:border-[#8A1A1A] disabled:opacity-50 min-w-[100px]"
                >
                  {names.map((name, i) => (
                    <option key={i} value={i}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap items-center justify-end sm:justify-between w-full sm:w-auto gap-2">
                <div className="flex items-center gap-2">
                  <select
                    value={step.speed || 1.5}
                    onChange={(e) => handleSequenceSpeedChange(index, parseFloat(e.target.value))}
                    disabled={isPlaying}
                    className="text-sm bg-white border border-[#DCD1BA] rounded-lg px-2 py-1 text-[#4a3f35] font-bold focus:outline-none focus:border-[#8A1A1A] disabled:opacity-50 min-w-[70px]"
                    title="Playback Speed"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.4, 1.5, 1.75, 2].map(speed => (
                      <option key={speed} value={speed}>{speed}x</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    min="1"
                    value={step.times}
                    onChange={(e) => handleSequenceTimeChange(index, parseInt(e.target.value) || 1)}
                    disabled={isPlaying}
                    className="w-16 bg-white border border-[#DCD1BA] rounded-lg p-1 text-center text-sm font-bold text-[#6a1515] focus:outline-none focus:border-[#8A1A1A] transition-colors disabled:opacity-50"
                    title="Loop Count"
                  />
                  <span className="text-xs text-[#8c7462] font-medium pr-1">遍</span>
                </div>
                <button
                  onClick={() => handleDeleteStep(index)}
                  disabled={isPlaying || sequence.length <= 1}
                  className="p-1.5 text-[#dcb5b5] hover:text-[#8A1A1A] transition-colors rounded-full hover:bg-[#E8DEC7] disabled:opacity-30 disabled:hover:text-[#dcb5b5] disabled:hover:bg-transparent"
                  title="Delete Step"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddStep}
          disabled={isPlaying}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-[#E8DEC7] hover:bg-[#DCD1BA] text-[#5c4a3d] font-bold py-2.5 rounded-xl border border-[#DCD1BA] border-dashed transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add New Step
        </button>
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
              <>Step {currentStep + 1} ({names[sequence[currentStep].audioIndex]})</>
            )}
          </div>
          <div className="text-base text-[#8c7462] mt-1 font-bold">
            Play Count: {currentLoop + 1} of {sequence[currentStep]?.times || 0}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
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

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              setIsPlaying(false);
              
              const step = sequence[currentStep];
              if (currentLoop > 0 && audios[step.audioIndex] && onRecordHistory) {
                onRecordHistory(names[step.audioIndex], currentLoop);
              }
              setCurrentStep(0);
              setCurrentLoop(0);
            }}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-white border border-[#DCD1BA] text-[#6a1515] shadow-md hover:bg-[#E8DEC7] active:scale-95 transition-all"
            title="Stop & Reset"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        onEnded={handleEnded}
        onCanPlay={(e) => {
          if (sequence[currentStep]) {
            (e.target as HTMLAudioElement).playbackRate = sequence[currentStep].speed || 1.5;
          }
        }}
        className="hidden" 
      />
    </div>
  );
}
