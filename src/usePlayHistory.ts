import { useState, useEffect } from 'react';

export interface PlayHistoryRecord {
  id: string;
  timestamp: number;
  date: string;
  title: string;
  count: number;
  mode: 'Audio' | 'Auto';
}

export function usePlayHistory() {
  const [history, setHistory] = useState<PlayHistoryRecord[]>(() => {
    const saved = localStorage.getItem('sutra_play_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // keep records from the last 24 hours
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return parsed.filter((r: PlayHistoryRecord) => r.timestamp > oneDayAgo);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sutra_play_history', JSON.stringify(history));
  }, [history]);

  const addRecord = (title: string, count: number, mode: 'Audio' | 'Auto') => {
    if (count <= 0) return;
    const newRecord: PlayHistoryRecord = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      date: new Date().toLocaleString(),
      title,
      count,
      mode
    };
    setHistory(prev => [newRecord, ...prev]);
  };

  const deleteRecord = (id: string) => {
    setHistory(prev => prev.filter(r => r.id !== id));
  };
  
  const clearHistory = () => {
    setHistory([]);
  };

  return { history, addRecord, deleteRecord, clearHistory };
}
