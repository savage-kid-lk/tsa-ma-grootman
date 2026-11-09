import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/** Gate a route behind sign-in (and optionally the admin role). */
export default function RequireAuth({ admin = false, children }) {
  const { ready, user, profile, isAdmin } = useAuth();
  const location = useLocation();

  if (!ready || (user && admin && !profile)) {
    return <div className="container notfound"><span className="spinner" aria-label="Loading" /></div>;
  }
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (admin && !isAdmin) {
    return (
      <div className="container notfound">
        <h1 style={{ fontSize: '2.4rem', textTransform: 'uppercase' }}>Admins only</h1>
        <p className="muted" style={{ margin: '16px 0 28px' }}>Your account doesn't have access to the dashboard.</p>
      </div>
    );
  }
  return children;
}
