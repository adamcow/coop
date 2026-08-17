import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Database } from '../types/supabase';

type Log = Database['public']['Tables']['logs']['Row'];

export default function ChickenLogs({ chickenId }: { chickenId: string }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [logType, setLogType] = useState('General Note');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('chicken_id', chickenId)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching logs:', error);
    else setLogs(data || []);
  };

  useEffect(() => {
    fetchLogs();
  }, [chickenId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase
      .from('logs')
      .insert([{ chicken_id: chickenId, log_type: logType, notes }]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setNotes('');
      fetchLogs(); // Refresh the list
    }
    setLoading(false);
  };

  return (
    <div className="chicken-logs-section">
      <h3>Notes & Health Log</h3>

      <form onSubmit={handleSubmit} className="log-form">
        <select
          value={logType}
          onChange={(e) => setLogType(e.target.value)}
          className="form-input"
        >
          <option value="General Note">General Note</option>
          <option value="Health">Health</option>
        </select>

        <textarea
          placeholder="Add a note..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          required
          rows={3}
          className="form-input"
        />

        <button
          type="submit"
          disabled={loading || !notes.trim()}
          className="auth-button"
        >
          {loading ? 'Saving...' : 'Save Note'}
        </button>

        {error && <p className="error-text">{error}</p>}
      </form>

      <div className="log-list">
        {logs.length === 0 ? (
          <p className="empty-state">No notes yet.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="log-card">
              <div className="log-header">
                <strong>{log.log_type}</strong>
                <span>{new Date(log.created_at!).toLocaleDateString()}</span>
              </div>
              <p className="log-content">{log.notes}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
