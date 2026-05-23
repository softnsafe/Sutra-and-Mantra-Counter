import React, { useState } from 'react';
import { Home } from './Home';
import { SutraView } from './SutraView';
import { useCounters } from './useCounters';

type ViewState = 
  | { type: 'home' } 
  | { type: 'sutra'; id: string };

export default function App() {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const { counters, increment, decrement, setParam, reset, resetAll } = useCounters();

  const handleNavigate = (newView: ViewState) => setView(newView);
  const handleBack = () => setView({ type: 'home' });

  if (view.type === 'sutra') {
    return (
      <SutraView 
        id={view.id}
        count={counters[view.id] || 0}
        onIncrement={() => increment(view.id)}
        onDecrement={() => decrement(view.id)}
        onReset={() => reset(view.id)}
        onSetParam={(val) => setParam(view.id, val)}
        onBack={handleBack}
        onChangeSutra={(id) => handleNavigate({ type: 'sutra', id })}
      />
    );
  }

  return (
    <Home 
      counters={counters}
      onNavigate={handleNavigate}
      onResetAll={resetAll}
    />
  );
}
