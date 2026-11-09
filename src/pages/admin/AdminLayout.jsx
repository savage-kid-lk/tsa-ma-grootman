import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Icon from '../../components/Icon.jsx';
import { ScrollManager, Toast } from '../../components/Layout.jsx';

const NAV = [
  { to: '/admin', label: 'Overview', icon: 'grid', end: true },
  { to: '/admin/products', label: 'Products', icon: 'box' },
  { to: '/admin/orders', label: 'Orders', icon: 'receipt' },
  { to: '/admin/content', label: 'Store info', icon: 'edit' },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  return (
    <div className="admin">
      <ScrollManager />
      <aside className="admin-side">
        <Link to="/" className="admin-brand"><img src="/img/logo-white.png" alt="" width="44" height="44" /><span>Dashboard</span></Link>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <Icon name={n.icon} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <Link to="/"><Icon name="external" /> View store</Link>
          <button type="button" onClick={signOut}><Icon name="logout" /> Sign out</button>
          <span className="muted small">{user?.email}</span>
        </div>
      </aside>
      <div className="admin-main"><Outlet /></div>
      <Toast />
    </div>
  );
}
