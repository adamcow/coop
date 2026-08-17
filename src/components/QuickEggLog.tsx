import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function QuickEggLog() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [count, setCount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogEggs = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // chicken_id is explicitly null for a flock-wide count
    const { error } = await supabase
      .from('egg_logs')
      .insert([{ date, count, chicken_id: null }]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setCount(1);
      setMessage('🥚 Eggs logged!');
      setTimeout(() => setMessage(''), 3000); // Clear success message after 3s
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        background: '#eef8f1',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #c2e2cb',
      }}
    >
      <h3 style={{ margin: '0 0 0.5rem 0' }}>Quick Egg Tally</h3>
      <form
        onSubmit={handleLogEggs}
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <input
          type="number"
          min="1"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value))}
          required
          style={{
            padding: '0.5rem',
            width: '60px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.5rem 1rem' }}
        >
          {loading ? 'Logging...' : 'Log Eggs'}
        </button>
        {message && (
          <span
            style={{
              fontWeight: 'bold',
              color: message.includes('Error') ? 'red' : 'green',
            }}
          >
            {message}
          </span>
        )}
      </form>
    </div>
  );
}
