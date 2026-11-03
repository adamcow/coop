import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
  } from 'react';
  import { supabase } from '../supabaseClient';
  import type { Database } from '../types/supabase';
  
  type EggLog = Database['public']['Tables']['egg_logs']['Row'];
  
  export interface EggStatsHandle {
    refresh: () => void;
  }
  
  const EggStats = forwardRef<EggStatsHandle>(function EggStats(_props, ref) {
    const [logs, setLogs] = useState<EggLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
  
    const fetchEggLogs = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('egg_logs')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
  
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setLogs(data ?? []);
      }
      setLoading(false);
    };
  
    useEffect(() => {
      fetchEggLogs();
    }, []);
  
    useImperativeHandle(ref, () => ({
      refresh: fetchEggLogs,
    }));
  
    const handleDelete = async (id: string) => {
      setDeletingId(id);
      const { error: deleteError } = await supabase
        .from('egg_logs')
        .delete()
        .eq('id', id);
  
      if (deleteError) {
        setError(deleteError.message);
      } else {
        setLogs((prev) => prev.filter((item) => item.id !== id));
      }
      setDeletingId(null);
    };
  
    // Date boundaries in YYYY-MM-DD local/ISO format
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
  
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  
    const monthPrefix = todayStr.slice(0, 7); // YYYY-MM
  
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    let totalCount = 0;
  
    for (const log of logs) {
      totalCount += log.count;
      if (log.date === todayStr) {
        todayCount += log.count;
      }
      if (log.date >= sevenDaysAgoStr && log.date <= todayStr) {
        weekCount += log.count;
      }
      if (log.date.startsWith(monthPrefix)) {
        monthCount += log.count;
      }
    }
  
    const recentLogs = logs.slice(0, 5);
  
    return (
      <section className="egg-stats-section">
        <div className="egg-stats-grid">
          <div className="egg-stat-card">
            <span className="egg-stat-label">Today</span>
            <strong className="egg-stat-value">{loading ? '–' : todayCount}</strong>
          </div>
          <div className="egg-stat-card">
            <span className="egg-stat-label">Last 7 Days</span>
            <strong className="egg-stat-value">{loading ? '–' : weekCount}</strong>
          </div>
          <div className="egg-stat-card">
            <span className="egg-stat-label">This Month</span>
            <strong className="egg-stat-value">{loading ? '–' : monthCount}</strong>
          </div>
          <div className="egg-stat-card">
            <span className="egg-stat-label">All Time</span>
            <strong className="egg-stat-value">{loading ? '–' : totalCount}</strong>
          </div>
        </div>
  
        {error && <p className="coop-error">{error}</p>}
  
        {!loading && recentLogs.length > 0 && (
          <div className="egg-recent">
            <h4 className="egg-recent-title">Recent Egg Logs</h4>
            <ul className="egg-recent-list">
              {recentLogs.map((item) => (
                <li key={item.id} className="egg-recent-item">
                  <span className="egg-recent-date">{item.date}</span>
                  <span className="egg-recent-count">
                    {item.count} {item.count === 1 ? 'egg' : 'eggs'}
                  </span>
                  <button
                    type="button"
                    className="egg-recent-delete"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    aria-label={`Delete log of ${item.count} eggs on ${item.date}`}
                    title="Delete entry"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    );
  });
  
  export default EggStats;