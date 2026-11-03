import { useState } from 'react';
import type { Database } from '../types/supabase';
import { supabase } from '../supabaseClient';
import ChickenLogs from './ChickenLogs';
import StatusBadge from './StatusBadge';
import BirdForm from './BirdForm';

type Chicken = Database['public']['Tables']['chickens']['Row'];

interface ChickenProfileProps {
  chicken: Chicken;
  onBack: () => void;
  onUpdated: (chicken: Chicken) => void;
  onDeleted: () => void;
}

export default function ChickenProfile({
  chicken,
  onBack,
  onUpdated,
  onDeleted,
}: ChickenProfileProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete ${chicken.name}? This removes their profile and notes and can't be undone.\n\n` +
        `If ${chicken.name} has passed away or moved on, set their status to Deceased or Rehomed instead to keep their history.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    // Remove this bird's notes, and keep egg tallies but unlink them from the bird
    const { error: logsError } = await supabase
      .from('logs')
      .delete()
      .eq('chicken_id', chicken.id);
    if (logsError) {
      setError(logsError.message);
      setDeleting(false);
      return;
    }

    const { error: eggError } = await supabase
      .from('egg_logs')
      .update({ chicken_id: null })
      .eq('chicken_id', chicken.id);
    if (eggError) {
      setError(eggError.message);
      setDeleting(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from('chickens')
      .delete()
      .eq('id', chicken.id);
    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    setDeleting(false);
    onDeleted();
  };

  return (
    <section className="chicken-profile">
      <button
        type="button"
        className="auth-button ghost profile-back"
        onClick={onBack}
      >
        &larr; Back to Flock
      </button>

      <div className="profile-card">
        <div className="profile-photo">
          {chicken.photo_url ? (
            <img src={chicken.photo_url} alt={chicken.name} />
          ) : (
            <div className="profile-photo-placeholder" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="64"
                height="64"
                fill="currentColor"
              >
                <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v1a5 5 0 0 1-5 5h-1a3 3 0 0 1-3 3 3 3 0 0 1-3-3 5 5 0 0 1-5-5v-1a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4Z" />
              </svg>
            </div>
          )}
        </div>
        <div className="profile-info">
          <div className="profile-header">
            <h2 className="profile-name">{chicken.name}</h2>
            {chicken.status && <StatusBadge status={chicken.status} />}
          </div>

          <dl className="profile-attributes">
            {chicken.breed && (
              <div className="profile-attribute">
                <dt>Breed</dt>
                <dd>{chicken.breed}</dd>
              </div>
            )}
            {chicken.sex && (
              <div className="profile-attribute">
                <dt>Sex</dt>
                <dd className="capitalize">{chicken.sex}</dd>
              </div>
            )}
            {chicken.hatch_date && (
              <div className="profile-attribute">
                <dt>Hatch Date</dt>
                <dd>{chicken.hatch_date}</dd>
              </div>
            )}
          </dl>

          {chicken.features && (
            <div className="profile-features">
              <h3>Identifying Features</h3>
              <p>{chicken.features}</p>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <div className="profile-actions">
            <button
              type="button"
              className="auth-button"
              onClick={() => setEditOpen(true)}
              disabled={deleting}
            >
              Edit
            </button>
            <button
              type="button"
              className="auth-button danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <ChickenLogs chickenId={chicken.id} />

      <BirdForm
        open={editOpen}
        chicken={chicken}
        onClose={() => setEditOpen(false)}
        onSubmitted={(saved) => {
          setEditOpen(false);
          if (saved) onUpdated(saved);
        }}
      />
    </section>
  );
}