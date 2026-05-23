import { useState, useEffect } from 'react';

export function useCounters() {
  const [counters, setCounters] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('sutra-counters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('sutra-counters', JSON.stringify(counters));
  }, [counters]);

  const increment = (id: string, amount: number = 1) => {
    setCounters(prev => ({ ...prev, [id]: (prev[id] || 0) + amount }));
  };

  const decrement = (id: string, amount: number = 1) => {
    setCounters(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - amount) }));
  };

  const setParam = (id: string, val: number) => {
    setCounters(prev => ({ ...prev, [id]: Math.max(0, val) }));
  };

  const reset = (id: string) => {
    setCounters(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const resetAll = () => {
    if (window.confirm('确定要重置所有计数器吗？ (Are you sure you want to reset all counters?)')) {
      setCounters({});
    }
  };

  return { counters, increment, decrement, setParam, reset, resetAll };
}
