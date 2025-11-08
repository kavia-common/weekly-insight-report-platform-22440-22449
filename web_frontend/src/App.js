import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// Theme tokens - Ocean Professional
const themeTokens = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  success: '#F59E0B',
  error: '#EF4444',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
  shadow: '0 6px 18px rgba(17, 24, 39, 0.08)',
  radius: '12px',
};

// --- API Client --- //
// PUBLIC_INTERFACE
export function createApiClient() {
  /**
   * PUBLIC_INTERFACE
   * Creates an API client bound to a base URL from environment variables.
   * Order of precedence:
   * - REACT_APP_API_BASE
   * - REACT_APP_BACKEND_URL
   * If neither is set, falls back to empty string (relative paths).
   */
  const base =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    '';

  const featureFlagsRaw = process.env.REACT_APP_FEATURE_FLAGS || '';
  const featureFlags = featureFlagsRaw
    ? featureFlagsRaw.split(',').map(f => f.trim()).filter(Boolean)
    : [];

  // Helper: safe fetch with JSON
  async function request(path, options = {}) {
    const url = `${base}${path}`;
    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        method: options.method || 'GET',
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : await res.text();
      if (!res.ok) {
        return { ok: false, status: res.status, error: data || 'Request failed' };
      }
      return { ok: true, status: res.status, data };
    } catch (err) {
      // Graceful fallback when backend unavailable
      return { ok: false, status: 0, error: err?.message || 'Network error' };
    }
  }

  return {
    baseUrl: base,
    featureFlags,
    // PUBLIC_INTERFACE
    postReport: (payload) => request('/api/reports', { method: 'POST', body: payload }),
    // PUBLIC_INTERFACE
    getReports: () => request('/api/reports', { method: 'GET' }),
    // PUBLIC_INTERFACE
    health: () => request('/'),
  };
}

// --- Layout Components --- //
function Header({ onToggleTheme, theme }) {
  return (
    <header style={{
      background: `linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(249, 250, 251, 1))`,
      borderBottom: '1px solid rgba(17,24,39,0.07)',
      backdropFilter: 'saturate(180%) blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 20px',
        maxWidth: 1280,
        margin: '0 auto',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: themeTokens.primary,
            boxShadow: themeTokens.shadow,
            display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700
          }}>WR</div>
          <div>
            <div style={{ fontWeight: 700, color: themeTokens.text }}>Weekly Reports</div>
            <div style={{ fontSize: 12, color: 'rgba(17,24,39,0.6)' }}>DigitalT3</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={onToggleTheme}
            className="btn"
            style={{
              background: theme === 'light' ? themeTokens.primary : themeTokens.secondary,
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '8px 12px',
              cursor: 'pointer',
              boxShadow: themeTokens.shadow,
            }}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            className="btn"
            style={{
              background: themeTokens.surface,
              color: themeTokens.text,
              border: '1px solid rgba(17,24,39,0.1)',
              borderRadius: 10,
              padding: '8px 12px',
              cursor: 'pointer',
            }}
            onClick={() => alert('TODO: Implement quick action')}
          >
            Quick Action
          </button>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: themeTokens.surface,
              border: '1px solid rgba(17,24,39,0.08)',
              borderRadius: 999,
              boxShadow: themeTokens.shadow,
            }}
            title="User info placeholder"
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)'
            }} />
            <span style={{ fontSize: 13, color: 'rgba(17,24,39,0.8)' }}>Guest</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function SideNav() {
  const baseItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    color: 'rgba(17,24,39,0.8)',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'all .2s ease',
  };
  const activeStyle = {
    background: '#eef2ff',
    color: themeTokens.primary,
    boxShadow: themeTokens.shadow,
  };
  return (
    <nav style={{ padding: 12 }}>
      <NavLink to="/dashboard" style={({ isActive }) => ({ ...baseItemStyle, ...(isActive ? activeStyle : {}) })}>
        📊 Dashboard
      </NavLink>
      <NavLink to="/reports" style={({ isActive }) => ({ ...baseItemStyle, ...(isActive ? activeStyle : {}) })}>
        📝 Reports
      </NavLink>
      <NavLink to="/history" style={({ isActive }) => ({ ...baseItemStyle, ...(isActive ? activeStyle : {}) })}>
        🗂️ History
      </NavLink>
    </nav>
  );
}

// --- Pages --- //
function DashboardPage({ api }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={cardStyle()}>
        <h2 style={cardTitleStyle()}>AI Summary</h2>
        <p style={{ color: 'rgba(17,24,39,0.7)' }}>
          Placeholder for AI-summarized weekly insights. Coming soon.
        </p>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href="/reports" style={pillLinkStyle()}>Create Report</a>
          <a href="/history" style={pillLinkStyle()}>View History</a>
        </div>
      </section>
      <section style={cardStyle()}>
        <h2 style={cardTitleStyle()}>Team Pulse</h2>
        <div style={{ color: 'rgba(17,24,39,0.7)' }}>
          Metrics and trends will appear here. API base: <strong>{api.baseUrl || '(relative)'}</strong>
        </div>
      </section>
    </div>
  );
}

function ReportsPage({ api }) {
  const [progress, setProgress] = useState('');
  const [blockers, setBlockers] = useState('');
  const [plans, setPlans] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await api.postReport({ progress, blockers, plans });
    if (res.ok) {
      setStatus({ type: 'success', message: 'Report submitted successfully' });
      setProgress(''); setBlockers(''); setPlans('');
    } else {
      setStatus({ type: 'error', message: `Submit failed: ${res.error || res.status}` });
    }
    setLoading(false);
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={cardStyle()}>
        <h2 style={cardTitleStyle()}>Weekly Report</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label htmlFor="progress" style={labelStyle()}>Progress</label>
            <textarea id="progress" value={progress} onChange={(e) => setProgress(e.target.value)} required rows={4} style={textareaStyle()} placeholder="What did you accomplish this week?" />
          </div>
          <div>
            <label htmlFor="blockers" style={labelStyle()}>Blockers</label>
            <textarea id="blockers" value={blockers} onChange={(e) => setBlockers(e.target.value)} rows={3} style={textareaStyle()} placeholder="Any issues or risks?" />
          </div>
          <div>
            <label htmlFor="plans" style={labelStyle()}>Plans</label>
            <textarea id="plans" value={plans} onChange={(e) => setPlans(e.target.value)} rows={3} style={textareaStyle()} placeholder="What do you plan for next week?" />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="submit" disabled={loading} style={primaryButtonStyle()}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
            <span style={{ fontSize: 12, color: 'rgba(17,24,39,0.6)' }}>
              POST to /api/reports via env-based API client
            </span>
          </div>
          {status && (
            <div role="status" style={{
              marginTop: 6,
              padding: '10px 12px',
              borderRadius: 10,
              color: status.type === 'success' ? '#065f46' : '#7f1d1d',
              background: status.type === 'success' ? '#d1fae5' : '#fee2e2',
              border: `1px solid ${status.type === 'success' ? '#10b981' : '#ef4444'}`,
            }}>
              {status.message}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

function HistoryPage() {
  const placeholder = [
    { id: 1, title: 'Week 34 - Your report', date: '2025-08-22' },
    { id: 2, title: 'Week 33 - Your report', date: '2025-08-15' },
  ];
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={cardStyle()}>
        <h2 style={cardTitleStyle()}>History</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {placeholder.map(item => (
            <li key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: 10,
              background: themeTokens.surface,
              border: '1px solid rgba(17,24,39,0.08)',
            }}>
              <div style={{ fontWeight: 600, color: themeTokens.text }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(17,24,39,0.6)' }}>{item.date}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// --- Styles helpers --- //
const cardStyle = () => ({
  background: themeTokens.surface,
  borderRadius: themeTokens.radius,
  boxShadow: themeTokens.shadow,
  border: '1px solid rgba(17,24,39,0.07)',
  padding: 16,
});

const cardTitleStyle = () => ({
  margin: 0,
  marginBottom: 8,
  color: themeTokens.text,
  fontSize: 18,
});

const labelStyle = () => ({
  display: 'block',
  fontWeight: 600,
  marginBottom: 6,
  color: 'rgba(17,24,39,0.9)',
});

const textareaStyle = () => ({
  width: '100%',
  borderRadius: 12,
  border: '1px solid rgba(17,24,39,0.15)',
  padding: 12,
  resize: 'vertical',
  fontFamily: 'inherit',
  outline: 'none',
});

const primaryButtonStyle = () => ({
  background: `linear-gradient(135deg, ${themeTokens.primary}, #3B82F6)`,
  color: 'white',
  border: 'none',
  padding: '10px 14px',
  borderRadius: 12,
  cursor: 'pointer',
  boxShadow: themeTokens.shadow,
});

const pillLinkStyle = () => ({
  display: 'inline-block',
  padding: '8px 12px',
  borderRadius: 9999,
  background: '#eef2ff',
  color: themeTokens.primary,
  border: '1px solid rgba(37, 99, 235, 0.2)',
  textDecoration: 'none',
  fontWeight: 700,
});

// --- Auth placeholder hook --- //
function useAuthPlaceholder() {
  // TODO: integrate real auth (OAuth/OIDC). For now, simulate logged in user.
  const [user, setUser] = useState({ name: 'Guest', id: null });
  return { user, setUser };
}

// --- Shell Layout --- //
function Shell() {
  const [theme, setTheme] = useState('light');
  const api = useMemo(() => createApiClient(), []);
  const { user } = useAuthPlaceholder();

  useEffect(() => {
    document.body.style.background = themeTokens.background;
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', minHeight: '100vh' }}>
      <Header onToggleTheme={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))} theme={theme} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: 16,
        maxWidth: 1280,
        width: '100%',
        margin: '16px auto',
        padding: '0 16px',
      }}>
        <aside style={{
          background: themeTokens.surface,
          border: '1px solid rgba(17,24,39,0.08)',
          borderRadius: themeTokens.radius,
          boxShadow: themeTokens.shadow,
          height: 'fit-content',
          position: 'sticky',
          top: 84,
        }}>
          <div style={{
            padding: '12px 12px 0 12px',
            color: 'rgba(17,24,39,0.6)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.4,
          }}>
            Navigation
          </div>
          <SideNav />
          <div style={{ padding: 12, borderTop: '1px dashed rgba(17,24,39,0.08)', fontSize: 12, color: 'rgba(17,24,39,0.6)' }}>
            <div title="Feature flags">Flags: {(api.featureFlags || []).join(', ') || 'none'}</div>
            <div>User: {user?.name || 'Anonymous'}</div>
          </div>
        </aside>
        <main style={{ display: 'block', minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage api={api} />} />
            <Route path="/reports" element={<ReportsPage api={api} />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<div style={cardStyle()}>Not Found</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * PUBLIC_INTERFACE
   * App entry that sets up the Router and renders the main Shell layout.
   */
  return (
    <Router>
      <Shell />
    </Router>
  );
}

export default App;
