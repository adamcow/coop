import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import type { Database } from '../types/supabase';
import { supabase } from '../supabaseClient';
import StatusBadge from './StatusBadge';

type Chicken = Database['public']['Tables']['chickens']['Row'];

interface FlockGridProps {
  activeCoopId: string | null;
  onSelectChicken: (chicken: Chicken) => void;
}

export interface FlockGridHandle {
  refresh: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'status-active',
  molting: 'status-molting',
  broody: 'status-broody',
  sick: 'status-sick',
  deceased: 'status-deceased',
};

const FlockGrid = forwardRef<FlockGridHandle, FlockGridProps>(
  function FlockGrid({ activeCoopId, onSelectChicken }, ref) {
    const [chickens, setChickens] = useState<Chicken[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchRef = useRef<() => void>(() => {});

    const fetchChickens = async () => {
      setLoading(true);
      setError(null);
      let query = supabase.from('chickens').select('*').order('name');
      if (activeCoopId) {
        query = query.eq('coop_id', activeCoopId);
      }
      const { data, error: fetchError } = await query;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setChickens(data ?? []);
      }
      setLoading(false);
    };

    fetchRef.current = fetchChickens;

    useEffect(() => {
      fetchRef.current();
    }, [activeCoopId]);

    useImperativeHandle(ref, () => ({
      refresh: () => fetchRef.current(),
    }));

    if (loading) {
      return <p className="flock-status">Loading your flock…</p>;
    }

    if (error) {
      return <p className="flock-error">{error}</p>;
    }

    if (chickens.length === 0) {
      return (
        <p className="flock-status">
          No chickens here yet. Add a chicken to start tracking your flock.
        </p>
      );
    }

    return (
      <div className="flock-grid">
        {chickens.map((chicken) => (
          <article
            key={chicken.id}
            className="chicken-card"
            onClick={() => onSelectChicken(chicken)}
          >
            <div className="chicken-photo">
              {chicken.photo_url ? (
                <img
                  src={chicken.photo_url}
                  alt={chicken.name}
                  loading="lazy"
                />
              ) : (
                <div className="chicken-photo-placeholder" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                    fill="currentColor"
                  >
                    <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v1a5 5 0 0 1-5 5h-1a3 3 0 0 1-3 3 3 3 0 0 1-3-3 5 5 0 0 1-5-5v-1a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4Z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="chicken-info">
              <h3 className="chicken-name">{chicken.name}</h3>
              {chicken.breed && (
                <p className="chicken-breed">{chicken.breed}</p>
              )}
              <div className="chicken-meta">
                {chicken.sex && (
                  <span className="chicken-sex">{chicken.sex}</span>
                )}
                <StatusBadge status={chicken.status} />
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }
);

export default FlockGrid;
