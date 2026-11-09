import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useStore } from '../../context/StoreContext.jsx';
import { CONTENT_DEFAULTS } from '../../useSiteContent.js';
import Icon from '../../components/Icon.jsx';
import usePageTitle from '../../usePageTitle.js';

async function saveContent(key, data) {
  return supabase.from('site_content').upsert({ key, data });
}

function SizeGuideEditor({ initial, onSaved }) {
  const [intro, setIntro] = useState(initial.intro || '');
  const [rows, setRows] = useState(initial.rows || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setCell = (i, k, v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const move = (i, d) => setRows((rs) => {
    const j = i + d;
    if (j < 0 || j >= rs.length) return rs;
    const next = [...rs]; [next[i], next[j]] = [next[j], next[i]]; return next;
  });

  const save = async () => {
    setError('');
    const clean = rows.map((r) => ({ size: r.size.trim(), chest: r.chest.trim(), length: r.length.trim() })).filter((r) => r.size);
    setSaving(true);
    const { error: e } = await saveContent('size_guide', { intro: intro.trim(), rows: clean });
    setSaving(false);
    if (e) setError(e.message); else { setRows(clean); onSaved('Size guide saved'); }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Size guide</h3>
        <button type="button" className="btn btn-dark btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save size guide'}</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="field">
        <label htmlFor="sg-intro">Intro text</label>
        <textarea id="sg-intro" value={intro} onChange={(e) => setIntro(e.target.value)} style={{ minHeight: 90 }} />
      </div>
      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table className="admin-table size-editor">
          <thead><tr><th>Size</th><th>Chest (cm)</th><th>Length (cm)</th><th /></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td><input value={r.size} onChange={(e) => setCell(i, 'size', e.target.value)} aria-label="Size" placeholder="e.g. M" /></td>
                <td><input value={r.chest} onChange={(e) => setCell(i, 'chest', e.target.value)} aria-label="Chest" inputMode="decimal" /></td>
                <td><input value={r.length} onChange={(e) => setCell(i, 'length', e.target.value)} aria-label="Length" inputMode="decimal" /></td>
                <td className="row-actions">
                  <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><Icon name="up" /></button>
                  <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down"><Icon name="down" /></button>
                  <button type="button" className="icon-btn" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} aria-label="Remove row"><Icon name="trash" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => setRows((rs) => [...rs, { size: '', chest: '', length: '' }])}>
        <Icon name="plus" /> Add size
      </button>
    </section>
  );
}

function ReturnsEditor({ initial, onSaved }) {
  const [body, setBody] = useState(initial.body || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    if (!body.trim()) { setError('The returns policy can’t be empty.'); return; }
    setSaving(true);
    const { error: e } = await saveContent('returns', { body: body.trim() });
    setSaving(false);
    if (e) setError(e.message); else onSaved('Returns & exchanges saved');
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Returns &amp; exchanges</h3>
        <button type="button" className="btn btn-dark btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save returns policy'}</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="field">
        <label htmlFor="rt-body">Policy text</label>
        <textarea id="rt-body" value={body} onChange={(e) => setBody(e.target.value)} style={{ minHeight: 200 }} />
      </div>
      <p className="muted small" style={{ marginTop: 8 }}>Leave an empty line between paragraphs.</p>
    </section>
  );
}

export default function AdminContent() {
  usePageTitle('Store info');
  const { showToast } = useStore();
  const [content, setContent] = useState(null);

  useEffect(() => {
    supabase.from('site_content').select('key, data').then(({ data }) => {
      const map = { ...CONTENT_DEFAULTS };
      (data || []).forEach((r) => { map[r.key] = { ...CONTENT_DEFAULTS[r.key], ...r.data }; });
      setContent(map);
    });
  }, []);

  if (!content) return <span className="spinner" />;
  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Store info</h1>
          <p className="muted" style={{ margin: '6px 0 0' }}>Shown on the <Link to="/contact#sizing" target="_blank" style={{ textDecoration: 'underline' }}>Contact &amp; help page</Link>.</p>
        </div>
      </div>
      <div className="stack" style={{ maxWidth: 820 }}>
        <SizeGuideEditor initial={content.size_guide} onSaved={showToast} />
        <ReturnsEditor initial={content.returns} onSaved={showToast} />
      </div>
    </>
  );
}
