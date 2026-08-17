import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import CoopSelector from './components/CoopSelector';
import FlockGrid from './components/FlockGrid';
import type { FlockGridHandle } from './components/FlockGrid';
import BirdForm from './components/BirdForm';
import ChickenProfile from './components/ChickenProfile';
import QuickEggLog from './components/QuickEggLog';
import type { Database } from './types/supabase';
import './App.css';

type Chicken = Database['public']['Tables']['chickens']['Row'];

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCoopId, setActiveCoopId] = useState<string | null>(null);
  const [birdFormOpen, setBirdFormOpen] = useState(false);
  const [selectedChicken, setSelectedChicken] = useState<Chicken | null>(null);
  const flockRef = useRef<FlockGridHandle>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <main className="auth-gate">
        <div className="auth-card">
          <p className="auth-status">Loading…</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <h1 className="dashboard-title">Coop Dashboard</h1>
          <div className="dashboard-user">
            <span className="dashboard-email">{session.user.email}</span>
            <button
              type="button"
              className="auth-button ghost"
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {selectedChicken ? (
          <ChickenProfile
            chicken={selectedChicken}
            onBack={() => setSelectedChicken(null)}
          />
        ) : (
          <>
            <CoopSelector
              activeCoopId={activeCoopId}
              onSelectCoop={setActiveCoopId}
            />

            <QuickEggLog />

            <div className="flock-header">
              <h2 className="flock-heading">Your Flock</h2>
              <button
                type="button"
                className="auth-button"
                onClick={() => setBirdFormOpen(true)}
              >
                + Add Chicken
              </button>
            </div>
            <FlockGrid
              ref={flockRef}
              activeCoopId={activeCoopId}
              onSelectChicken={setSelectedChicken}
            />
          </>
        )}
      </main>

      <BirdForm
        open={birdFormOpen}
        onClose={() => setBirdFormOpen(false)}
        defaultCoopId={activeCoopId}
        onSubmitted={() => {
          setBirdFormOpen(false);
          flockRef.current?.refresh();
        }}
      />
    </>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoggingIn(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoggingIn(false);

    if (signInError) {
      setError(signInError.message);
    }
    // If successful, the onAuthStateChange listener in App will automatically update the session and hide this form.
  };

  return (
    <main className="auth-gate">
      <div className="auth-card">
        <h1 className="auth-title">Coop Dashboard</h1>
        <p className="auth-subtitle">Sign in to manage your flock.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </label>

          <label className="auth-field" style={{ marginTop: '1rem' }}>
            <span className="auth-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-button"
            disabled={loggingIn}
            style={{ marginTop: '1.5rem' }}
          >
            {loggingIn ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default App;
