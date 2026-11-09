import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase, PRODUCT_BUCKET } from '../../lib/supabase.js';
import { SIZES } from '../../data/products.js';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import Icon from '../../components/Icon.jsx';
import usePageTitle from '../../usePageTitle.js';

const ALL = ''; // image shown for every colour
const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const EMPTY = {
  id: '', name: '', collection: 'logo', price: '', badge: '', short: '', description: '', sizes: SIZES,
  active: true, featured: false, sort_order: 0, unlimited_stock: true, stock_quantity: 0, low_stock_threshold: 5,
};

/** Web address for a new product, made from its name: "The Selector" → "the-selector" (or "the-selector-2" if taken). */
async function uniqueProductId(name) {
  const base = slugify(name) || 'product';
  const { data } = await supabase.from('products').select('id').like('id', `${base}%`);
  const taken = new Set((data || []).map((r) => r.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export default function AdminProductForm() {
  const { id } = useParams();
  const isNew = !id;
  usePageTitle(isNew ? 'New product' : 'Edit product');
  const navigate = useNavigate();
  const { refresh, collections } = useCatalog();
  const { showToast } = useStore();
  const fileInput = useRef(null);

  const [form, setForm] = useState(EMPTY);
  const [colors, setColors] = useState([{ id: crypto.randomUUID(), name: 'Black', hex: '#111111' }]);
  const [images, setImages] = useState([]);
  const [removedPaths, setRemovedPaths] = useState([]);
  const [uploadedThisSession, setUploadedThisSession] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error: e } = await supabase.from('products').select('*, product_colors(*), product_images(*)').eq('id', id).maybeSingle();
      if (e || !data) { setError(e?.message || 'Product not found.'); setLoading(false); return; }
      const { product_colors: pc, product_images: pi, ...p } = data;
      setForm({ ...EMPTY, ...p, badge: p.badge || '', short: p.short || '', description: p.description || '' });
      setColors([...pc].sort((a, b) => a.position - b.position).map(({ id: cid, name, hex }) => ({ id: cid, name, hex })));
      setImages([...pi].sort((a, b) => a.position - b.position).map((i) => ({ ...i, color_id: i.color_id || ALL })));
      setLoading(false);
    })();
  }, [id, isNew]);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const toggleSize = (s) => setForm((f) => ({
    ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : SIZES.filter((x) => x === s || f.sizes.includes(x)),
  }));

  // ---------- colours ----------
  const setColor = (i, k, v) => setColors((cs) => cs.map((c, j) => (j === i ? { ...c, [k]: v } : c)));
  const addColor = () => setColors((cs) => [...cs, { id: crypto.randomUUID(), name: '', hex: '#ffffff' }]);
  const removeColor = (i) => {
    const gone = colors[i].id;
    setColors((cs) => cs.filter((_, j) => j !== i));
    setImages((is) => is.map((im) => (im.color_id === gone ? { ...im, color_id: ALL } : im)));
  };

  // ---------- images ----------
  const upload = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    setUploading((n) => n + list.length);
    await Promise.all(list.map(async (file) => {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `products/${crypto.randomUUID()}.${ext}`;
      const { error: e } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, file, { cacheControl: '31536000', contentType: file.type });
      if (e) { showToast(`Upload failed: ${e.message}`); }
      else {
        const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
        setImages((is) => [...is, { id: crypto.randomUUID(), url: data.publicUrl, storage_path: path, color_id: colors[0]?.id || ALL, alt: '' }]);
        setUploadedThisSession((u) => [...u, path]);
      }
      setUploading((n) => n - 1);
    }));
  };
  const moveImage = (i, d) => setImages((is) => {
    const j = i + d;
    if (j < 0 || j >= is.length) return is;
    const next = [...is];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
  const setImage = (i, k, v) => setImages((is) => is.map((im, j) => (j === i ? { ...im, [k]: v } : im)));
  const removeImage = (i) => {
    const im = images[i];
    if (im.storage_path) setRemovedPaths((r) => [...r, im.storage_path]);
    setImages((is) => is.filter((_, j) => j !== i));
  };

  // ---------- save ----------
  const save = async (e) => {
    e.preventDefault();
    setError('');
    const price = Number(form.price);
    if (!form.name.trim()) return setError('Give the product a name.');
    if (!(price > 0)) return setError('Enter a price above R0.');
    if (!form.sizes.length) return setError('Choose at least one size.');
    const stockQty = Math.floor(Number(form.stock_quantity));
    const lowAt = Math.floor(Number(form.low_stock_threshold));
    if (!form.unlimited_stock && !(stockQty >= 0)) return setError('Enter how many are in stock (0 or more).');
    if (!form.unlimited_stock && !(lowAt >= 0)) return setError('Enter a low-stock alert level (0 or more).');
    if (!colors.length || colors.some((c) => !c.name.trim())) return setError('Every colour needs a name (add at least one colour).');
    if (new Set(colors.map((c) => c.name.trim().toLowerCase())).size !== colors.length) return setError('Colour names must be unique.');

    setSaving(true);
    try {
      const product = {
        name: form.name.trim(), collection: slugify(form.collection) || 'logo', price, badge: form.badge.trim() || null,
        short: form.short.trim() || null, description: form.description.trim() || null, sizes: form.sizes,
        active: form.active, featured: form.featured, sort_order: Number(form.sort_order) || 0,
        unlimited_stock: form.unlimited_stock,
        stock_quantity: form.unlimited_stock ? Math.max(0, Math.floor(Number(form.stock_quantity)) || 0) : stockQty,
        low_stock_threshold: form.unlimited_stock ? Math.max(0, Math.floor(Number(form.low_stock_threshold)) || 0) : lowAt,
      };
      const pid = isNew ? await uniqueProductId(product.name) : form.id;
      const res = isNew
        ? await supabase.from('products').insert({ id: pid, ...product })
        : await supabase.from('products').update(product).eq('id', pid);
      if (res.error) throw new Error(res.error.code === '23505' ? 'A product with a very similar name was just added — please save again.' : res.error.message);

      // colours: upsert current, delete removed
      const colorRows = colors.map((c, i) => ({ id: c.id, product_id: pid, name: c.name.trim(), hex: c.hex, position: i }));
      let r = await supabase.from('product_colors').upsert(colorRows);
      if (r.error) throw r.error;
      r = await supabase.from('product_colors').delete().eq('product_id', pid).not('id', 'in', `(${colorRows.map((c) => c.id).join(',')})`);
      if (r.error) throw r.error;

      // images: upsert current, delete removed
      const imageRows = images.map((im, i) => ({
        id: im.id, product_id: pid, url: im.url, storage_path: im.storage_path || null,
        color_id: im.color_id || null, alt: im.alt?.trim() || null, position: i,
      }));
      if (imageRows.length) {
        r = await supabase.from('product_images').upsert(imageRows);
        if (r.error) throw r.error;
        r = await supabase.from('product_images').delete().eq('product_id', pid).not('id', 'in', `(${imageRows.map((x) => x.id).join(',')})`);
      } else {
        r = await supabase.from('product_images').delete().eq('product_id', pid);
      }
      if (r.error) throw r.error;

      if (removedPaths.length) await supabase.storage.from(PRODUCT_BUCKET).remove(removedPaths);
      await refresh();
      showToast(isNew ? `Created ${product.name}` : `Saved ${product.name}`);
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const cancel = async () => {
    // discard files uploaded during this edit that were never saved
    if (uploadedThisSession.length) await supabase.storage.from(PRODUCT_BUCKET).remove(uploadedThisSession);
    navigate('/admin/products');
  };

  if (loading) return <span className="spinner" />;

  return (
    <form onSubmit={save} noValidate>
      <div className="admin-head">
        <div>
          <div className="crumbs" style={{ color: 'var(--muted)', marginBottom: 6 }}><Link to="/admin/products">Products</Link> / {isNew ? 'New' : form.name}</div>
          <h1>{isNew ? 'New product' : 'Edit product'}</h1>
        </div>
        <div className="row-actions">
          {!isNew && form.active && <Link to={`/product/${form.id}`} target="_blank" className="btn btn-outline"><Icon name="external" /> View</Link>}
          <button type="button" className="btn btn-outline" onClick={cancel}>Cancel</button>
          <button type="submit" className="btn btn-dark" disabled={saving || uploading > 0}>{saving ? 'Saving…' : 'Save product'}</button>
        </div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="admin-form-grid">
        <div className="stack">
          <section className="panel">
            <h3>Details</h3>
            <div className="form-grid">
              <div className="field full"><label htmlFor="p-name">Name</label><input id="p-name" value={form.name} onChange={set('name')} required /></div>
              <div className="field">
                <label htmlFor="p-col">Collection</label>
                <input id="p-col" list="collections" value={form.collection} onChange={set('collection')} />
                <datalist id="collections">{[...new Set(['logo', 'music', ...collections])].map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <div className="field"><label htmlFor="p-price">Price (ZAR, VAT incl.)</label><input id="p-price" type="number" min="1" step="0.01" value={form.price} onChange={set('price')} required /></div>
              <div className="field"><label htmlFor="p-badge">Badge (optional)</label><input id="p-badge" value={form.badge} onChange={set('badge')} placeholder="e.g. New, Bestseller" /></div>
              <div className="field full"><label htmlFor="p-short">Short description</label><input id="p-short" value={form.short} onChange={set('short')} maxLength={160} /></div>
              <div className="field full"><label htmlFor="p-desc">Full description</label><textarea id="p-desc" value={form.description} onChange={set('description')} /></div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h3>Images</h3>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => fileInput.current?.click()}><Icon name="upload" /> Upload</button>
            </div>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
            <div
              className="dropzone"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('over'); }}
              onDragLeave={(e) => e.currentTarget.classList.remove('over')}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('over'); upload(e.dataTransfer.files); }}
              onClick={() => fileInput.current?.click()}
            >
              <Icon name="upload" /> Drop photos here or click to choose — JPG, PNG, WebP up to 8 MB
              {uploading > 0 && <strong> · Uploading {uploading}…</strong>}
            </div>
            {images.length === 0 ? <p className="muted small">No images yet. The first image is the main one shown in the shop.</p> : (
              <div className="img-grid">
                {images.map((im, i) => (
                  <div className="img-tile" key={im.id}>
                    <div className="img-tile-media">
                      <img src={im.url} alt="" />
                      {i === 0 && <span className="badge">Main</span>}
                    </div>
                    <select className="select" value={im.color_id} onChange={(e) => setImage(i, 'color_id', e.target.value)} aria-label="Colour for this image">
                      <option value={ALL}>All colours</option>
                      {colors.map((c) => <option key={c.id} value={c.id}>{c.name || 'Unnamed colour'}</option>)}
                    </select>
                    <input className="alt-input" placeholder="Alt text (optional)" value={im.alt || ''} onChange={(e) => setImage(i, 'alt', e.target.value)} />
                    <div className="img-tile-actions">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Move earlier"><Icon name="up" /></button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} aria-label="Move later"><Icon name="down" /></button>
                      <button type="button" onClick={() => removeImage(i)} aria-label="Remove image" className="danger"><Icon name="trash" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="stack">
          <section className="panel">
            <h3>Visibility</h3>
            <label className="check"><input type="checkbox" checked={form.active} onChange={set('active')} /> Visible in the store</label>
            <label className="check"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Featured on the home page</label>
            <div className="field" style={{ marginTop: 12 }}><label htmlFor="p-sort">Sort order</label><input id="p-sort" type="number" value={form.sort_order} onChange={set('sort_order')} /></div>
          </section>

          <section className="panel">
            <h3>Inventory</h3>
            <label className="check"><input type="checkbox" checked={form.unlimited_stock} onChange={set('unlimited_stock')} /> Unlimited stock (never runs out)</label>
            {!form.unlimited_stock && (
              <div className="form-grid" style={{ marginTop: 12 }}>
                <div className="field">
                  <label htmlFor="p-stock">Quantity in stock</label>
                  <input id="p-stock" type="number" min="0" step="1" value={form.stock_quantity} onChange={set('stock_quantity')} />
                </div>
                <div className="field">
                  <label htmlFor="p-low">Low-stock alert at</label>
                  <input id="p-low" type="number" min="0" step="1" value={form.low_stock_threshold} onChange={set('low_stock_threshold')} />
                </div>
                <p className="muted small full" style={{ margin: 0 }}>
                  Shoppers see “Only {Number(form.low_stock_threshold) || 0} left” style warnings at or below the alert level, and “Sold out” at 0.
                  Stock goes down automatically when an order is paid.
                </p>
              </div>
            )}
          </section>

          <section className="panel">
            <h3>Sizes</h3>
            <div className="size-opts">
              {SIZES.map((s) => (
                <button key={s} type="button" className={form.sizes.includes(s) ? 'is-active' : ''} aria-pressed={form.sizes.includes(s)} onClick={() => toggleSize(s)}>{s}</button>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h3>Colours</h3>
              <button type="button" className="btn btn-outline btn-sm" onClick={addColor}><Icon name="plus" /> Add</button>
            </div>
            {colors.map((c, i) => (
              <div className="color-row" key={c.id}>
                <input type="color" value={c.hex} onChange={(e) => setColor(i, 'hex', e.target.value)} aria-label="Colour swatch" />
                <input value={c.name} onChange={(e) => setColor(i, 'name', e.target.value)} placeholder="Colour name" aria-label="Colour name" />
                <button type="button" className="icon-btn" onClick={() => removeColor(i)} aria-label={`Remove ${c.name || 'colour'}`}><Icon name="trash" /></button>
              </div>
            ))}
          </section>
        </div>
      </div>
    </form>
  );
}
