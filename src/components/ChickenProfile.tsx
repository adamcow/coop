import type { Database } from '../types/supabase';
import ChickenLogs from './ChickenLogs';
import StatusBadge from './StatusBadge';

type Chicken = Database['public']['Tables']['chickens']['Row'];

interface ChickenProfileProps {
  chicken: Chicken;
  onBack: () => void;
}

export default function ChickenProfile({
  chicken,
  onBack,
}: ChickenProfileProps) {
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
        </div>
      </div>
      <ChickenLogs chickenId={chicken.id} />
    </section>
  );
}
