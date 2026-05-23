import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, FileAudio } from 'lucide-react';

interface AudioPlayerProps {
  title: string;
}

export function AudioPlayer({ title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loopLimit, setLoopLimit] = useState<number>(108);
  const [loopCount, setLoopCount] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (loopCount + 1 < loopLimit) {
      setLoopCount(prev => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      setIsPlaying(false);
      setLoopCount(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (s: number) => {
    setSpeed(s);
    if (audioRef.current) {
      audioRef.current.playbackRate = s;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      let name = file.name;
      const lastDot = name.lastIndexOf('.');
      if (lastDot !== -1) {
        name = name.substring(0, lastDot);
      }
      setCustomTitle(name);

      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setLoopCount(0);
      setIsPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      }, 0);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col pt-4">
      <audio
        ref={audioRef}
        src={audioUrl || ''}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      {/* Player Card */}
      <div className="bg-[#FAF6EC] rounded-2xl p-8 shadow-sm border border-[#E8DEC7] flex flex-col items-center mb-4">
        <div className="w-32 h-32 rounded-full bg-[#E8DEC7] flex items-center justify-center mb-6 shadow-inner ring-4 ring-[#FAF6EC] outline outline-1 outline-[#E8DEC7]">
          <Music className="w-12 h-12 text-[#9A8462]" />
        </div>
        
        <h2 className="text-2xl font-serif font-bold text-[#6a1515] mb-8">{customTitle || title} Chant</h2>
        
        {/* Progress Bar */}
        <div className="w-full mb-8">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={!audioUrl}
            className="w-full h-2 bg-[#E8DEC7] rounded-lg appearance-none cursor-pointer accent-[#6a1515]"
          />
          <div className="flex justify-between text-xs font-mono text-[#9A8462] mt-2 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-8">
          <button className="text-[#6a1515] opacity-70 hover:opacity-100 transition-opacity disabled:opacity-30" disabled={!audioUrl}>
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          
          <button 
            onClick={togglePlay}
            disabled={!audioUrl}
            className="w-16 h-16 rounded-full bg-[#8A1A1A] flex items-center justify-center text-white shadow-lg shadow-red-900/20 active:scale-95 transition-transform disabled:opacity-50 disabled:bg-[#9A8462]"
          >
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
          
          <button className="text-[#6a1515] opacity-70 hover:opacity-100 transition-opacity disabled:opacity-30" disabled={!audioUrl}>
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>
      
      {/* Settings Row */}
      <div className="flex gap-4 mb-4">
        {/* Speed */}
        <div className="bg-[#FAF6EC] rounded-2xl p-4 shadow-sm border border-[#E8DEC7] flex-1">
          <h3 className="text-sm text-[#5c4a3d] font-medium mb-3">Speed</h3>
          <div className="flex justify-between">
            {[1.0, 1.2, 1.5, 2.0].map(s => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`text-sm px-2 py-1 rounded transition-colors ${speed === s ? 'bg-white shadow-sm font-bold text-[#6a1515]' : 'text-[#8c7462] hover:text-[#5c4a3d]'}`}
              >
                {s.toFixed(1)}x
              </button>
            ))}
          </div>
        </div>
        
        {/* Loop Count */}
        <div className="bg-[#FAF6EC] rounded-2xl p-4 shadow-sm border border-[#E8DEC7] flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm text-[#5c4a3d] font-medium">Loop Count</h3>
            <input 
              type="number" 
              value={loopLimit}
              onChange={(e) => setLoopLimit(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 bg-transparent outline-none text-right font-bold text-[#1a1a1a] font-serif text-base [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          <div className="w-full bg-white rounded-xl px-3 py-2 flex justify-center items-center shadow-sm text-sm border border-[#E8DEC7] font-bold text-[#1a1a1a] font-serif">
            {loopCount}/{loopLimit}
          </div>
        </div>
      </div>
      
      {/* File Upload / Add Audio */}
      <label className="w-full bg-[#FAF6EC] rounded-2xl p-4 shadow-sm border border-[#E8DEC7] flex items-center justify-center gap-2 cursor-pointer hover:bg-white transition-colors active:scale-95">
        <FileAudio className="w-5 h-5 text-[#6a1515]" />
        <span className="font-medium text-[#6a1515]">Add Local Audio File</span>
        <input 
          type="file" 
          accept="audio/*" 
          className="hidden" 
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
}
