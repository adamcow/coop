import { useState } from 'react';
import { supabase } from '../supabaseClient';

interface QuickEggLogProps {
  onEggsLogged?: () => void;
}

export default function QuickEggLog({ onEggsLogged }: QuickEggLogProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [count, setCount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleLogEggs = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    // chicken_id is explicitly null for a flock-wide count
    const { error } = await supabase
      .from('egg_logs')
      .insert([{ date, count, chicken_id: null }]);

    if (error) {
      setIsError(true);
      setMessage(`Error: ${error.message}`);
    } else {
      setCount(1);
      setMessage('🥚 Eggs logged!');
      onEggsLogged?.();
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  return (
    <section className="quick-egg-log-section">
      <h3 className="quick-egg-title">Quick Egg Tally</h3>
      <form onSubmit={handleLogEggs} className="quick-egg-form">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="form-input"
          aria-label="Egg log date"
        />
        <input
          type="number"
          min="1"
          value={count}
          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          required
          className="form-input quick-egg-number-input"
          aria-label="Number of eggs"
        />
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging…' : 'Log Eggs'}
        </button>
        {message && (
          <span
            className={`quick-egg-message ${
              isError ? 'message-error' : 'message-success'
            }`}
          >
            {message}
          </span>
        )}
      </form>
    </section>
  );
}