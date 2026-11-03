import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Database } from '../types/supabase';

type Log = Database['public']['Tables']['logs']['Row'];

const LOG_TYPES = ['General Note', 'Health'] as const;

export default function ChickenLogs({ chickenId }: { chickenId: string }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [logType, setLogType] = useState('General Note');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inline edit & delete state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLogType, setEditLogType] = useState('General Note');
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLogs = async () => {
    const { data, error: fetchError } = await supabase
      .from('logs')
      .select('*')
      .eq('chicken_id', chickenId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching logs:', fetchError);
      setError(fetchError.message);
    } else {
      setLogs(data || []);
    }
  };

  useEffect(() => {
    fetchLogs();
    setEditingId(null);
  }, [chickenId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase
      .from('logs')
      .insert([{ chicken_id: chickenId, log_type: logType, notes: notes.trim() }]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setNotes('');
      fetchLogs();
    }
    setLoading(false);
  };

  const startEdit = (log: Log) => {
    setEditingId(log.id);
    setEditLogType(log.log_type);
    setEditNotes(log.notes);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNotes('');
  };

  const handleSaveEdit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editNotes.trim()) return;

    setSavingEdit(true);
    setError('');

    const { data, error: updateError } = await supabase
      .from('logs')
      .update({
        log_type: editLogType,
        notes: editNotes.trim(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      setError(updateError.message);
    } else if (data) {
      setLogs((prev) => prev.map((item) => (item.id === id ? data : item)));
      setEditingId(null);
    }
    setSavingEdit(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;

    setDeletingId(id);
    setError('');

    const { error: deleteError } = await supabase
      .from('logs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setLogs((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) setEditingId(null);
    }
    setDeletingId(null);
  };

  return (
    <div className="chicken-logs-section">
      <h3>Notes &amp; Health Log</h3>

      <form onSubmit={handleSubmit} className="log-form">
        <select
          value={logType}
          onChange={(e) => setLogType(e.target.value)}
          className="form-input"
        >
          {LOG_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
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
              {editingId === log.id ? (
                <form
                  onSubmit={(e) => handleSaveEdit(e, log.id)}
                  className="log-edit-form"
                >
                  <select
                    value={editLogType}
                    onChange={(e) => setEditLogType(e.target.value)}
                    className="form-input"
                  >
                    {LOG_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    required
                    rows={3}
                    className="form-input"
                  />

                  <div className="log-edit-actions">
                    <button
                      type="button"
                      className="auth-button ghost log-action-btn"
                      onClick={cancelEdit}
                      disabled={savingEdit}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="auth-button log-action-btn"
                      disabled={savingEdit || !editNotes.trim()}
                    >
                      {savingEdit ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="log-header">
                    <div className="log-header-meta">
                      <strong>{log.log_type}</strong>
                      <span>
                        {log.created_at
                          ? new Date(log.created_at).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                    <div className="log-card-actions">
                      <button
                        type="button"
                        className="log-inline-btn"
                        onClick={() => startEdit(log)}
                        disabled={deletingId === log.id}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="log-inline-btn danger"
                        onClick={() => handleDelete(log.id)}
                        disabled={deletingId === log.id}
                      >
                        {deletingId === log.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                  <p className="log-content">{log.notes}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
