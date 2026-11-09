import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import usePageTitle from '../../usePageTitle.js';

const COPY = {
  login: { title: 'Sign in', heading: 'Welcome back, grootman.', button: 'Sign in' },
  register: { title: 'Create account', heading: 'Join the circle.', button: 'Create account' },
  forgot: { title: 'Reset password', heading: 'Forgot your password?', button: 'Send reset link' },
  reset: { title: 'New password', heading: 'Choose a new password.', button: 'Save password' },
};

/** Sign in · register · forgot password · set new password — one page, four modes. */
export default function AuthPage({ mode }) {
  const c = COPY[mode];
  usePageTitle(c.title);
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get('next') || '/account';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (ready && user && (mode === 'login' || mode === 'register')) return <Navigate to={next} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const d = Object.fromEntries(new FormData(f));
    setBusy(true); setError(''); setNotice('');
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: d.email, password: d.password });
        if (err) throw err;
        navigate(next, { replace: true });
      } else if (mode === 'register') {
        if (d.password !== d.confirm) throw new Error('Passwords do not match.');
        const { data, error: err } = await supabase.auth.signUp({
          email: d.email,
          password: d.password,
          options: { data: { full_name: d.name, phone: d.phone }, emailRedirectTo: `${window.location.origin}${next}` },
        });
        if (err) throw err;
        if (data.session) navigate(next, { replace: true });
        else setNotice('Check your inbox — we sent you a link to confirm your email address.');
      } else if (mode === 'forgot') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(d.email, { redirectTo: `${window.location.origin}/reset-password` });
        if (err) throw err;
        setNotice('If that email has an account, a reset link is on its way.');
      } else if (mode === 'reset') {
        if (d.password !== d.confirm) throw new Error('Passwords do not match.');
        const { error: err } = await supabase.auth.updateUser({ password: d.password });
        if (err) throw err;
        navigate('/account', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const qs = location.search;
  return (
    <div className="container auth-wrap">
      <form className="auth-card" onSubmit={submit} noValidate>
        <span className="eyebrow">{c.title}</span>
        <h1>{c.heading}</h1>

        {mode === 'register' && (
          <>
            <div className="field"><label htmlFor="a-name">Full name</label><input id="a-name" name="name" required autoComplete="name" /></div>
            <div className="field"><label htmlFor="a-phone">Cell number</label><input id="a-phone" name="phone" type="tel" autoComplete="tel" /></div>
          </>
        )}
        {mode !== 'reset' && (
          <div className="field"><label htmlFor="a-email">Email</label><input id="a-email" name="email" type="email" required autoComplete="email" /></div>
        )}
        {mode !== 'forgot' && (
          <div className="field">
            <label htmlFor="a-pass">{mode === 'reset' ? 'New password' : 'Password'}</label>
            <input id="a-pass" name="password" type="password" required minLength={mode === 'login' ? undefined : 8}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
        )}
        {(mode === 'register' || mode === 'reset') && (
          <div className="field"><label htmlFor="a-confirm">Confirm password</label><input id="a-confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" /></div>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-notice" role="status">{notice}</p>}

        <button className="btn btn-dark btn-block" type="submit" disabled={busy}>{busy ? 'Please wait…' : c.button}</button>

        <div className="auth-links">
          {mode === 'login' && (<><Link to={`/register${qs}`}>Create an account</Link><Link to="/forgot-password">Forgot password?</Link></>)}
          {mode === 'register' && <Link to={`/login${qs}`}>Already have an account? Sign in</Link>}
          {mode === 'forgot' && <Link to="/login">Back to sign in</Link>}
        </div>
      </form>
    </div>
  );
}
