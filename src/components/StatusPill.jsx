export default function StatusPill({ status }) {
  return <span className={`pill pill-${status}`}>{status}</span>;
}

export const formatDate = (d) =>
  new Date(d).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
