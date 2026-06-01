import { useState } from "react";

const initialCustomers = [
  { id: 1, name: "Maria González", address: "123 Oak St", phone: "787-555-0101", lotSize: "Medium", price: 45, notes: "Has a dog, keep gate closed", lastMowed: "2026-05-20", status: "active" },
  { id: 2, name: "James Reilly", address: "456 Pine Ave", phone: "787-555-0182", lotSize: "Large", price: 70, notes: "Mow every 2 weeks", lastMowed: "2026-05-15", status: "active" },
  { id: 3, name: "Sandra Cruz", address: "789 Maple Dr", phone: "787-555-0934", lotSize: "Small", price: 30, notes: "", lastMowed: "2026-05-28", status: "active" },
];

const LOT_SIZES = ["Small", "Medium", "Large", "Extra Large"];
const STATUSES = ["active", "inactive"];
const empty = { name: "", address: "", phone: "", lotSize: "Medium", price: "", notes: "", lastMowed: "", status: "active" };

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((new Date() - new Date(dateStr)) / 86400000);
}

function Badge({ days }) {
  if (days === null) return <span className="badge gray">Never</span>;
  if (days <= 7) return <span className="badge green">{days}d ago</span>;
  if (days <= 14) return <span className="badge yellow">{days}d ago</span>;
  return <span className="badge red">{days}d ago</span>;
}

export default function App() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function openAdd() { setForm(empty); setEditingId(null); setView("form"); }
  function openEdit(c) { setForm({ ...c }); setEditingId(c.id); setView("form"); }
  function openDetail(c) { setSelected(c); setView("detail"); }

  function saveForm() {
    if (!form.name.trim() || !form.address.trim()) return;
    if (editingId) {
      setCustomers(cs => cs.map(c => c.id === editingId ? { ...form, id: editingId } : c));
      setSelected({ ...form, id: editingId });
    } else {
      setCustomers(cs => [...cs, { ...form, id: Date.now() }]);
    }
    setView(editingId ? "detail" : "list");
  }

  function markMowed(id) {
    const today = new Date().toISOString().split("T")[0];
    setCustomers(cs => cs.map(c => c.id === id ? { ...c, lastMowed: today } : c));
    if (selected?.id === id) setSelected(s => ({ ...s, lastMowed: today }));
  }

  function deleteCustomer(id) {
    setCustomers(cs => cs.filter(c => c.id !== id));
    setConfirmDelete(null);
    setView("list");
  }

  const totalRevenue = customers.filter(c => c.status === "active").reduce((s, c) => s + Number(c.price || 0), 0);
  const dueCount = customers.filter(c => { const d = daysSince(c.lastMowed); return d === null || d >= 14; }).length;

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", minHeight: "100vh", background: "#f0f4ec", color: "#1a2e1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --green: #2d6a2d; --green-light: #4a9e4a; --green-pale: #e8f2e8; --red: #c0392b; --card: #ffffff; --border: #d4e4d4; --text-muted: #5a7a5a; }
        .header { background: var(--green); color: white; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 64px; position: sticky; top: 0; z-index: 10; box-shadow: 0 2px 12px rgba(0,0,0,0.15); }
        .logo { font-family: 'Playfair Display', serif; font-size: 22px; display: flex; align-items: center; gap: 10px; }
        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; border: none; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .btn-primary { background: var(--green); color: white; } .btn-primary:hover { background: #235023; }
        .btn-white { background: white; color: var(--green); } .btn-white:hover { background: var(--green-pale); }
        .btn-outline { background: transparent; color: var(--green); border: 1.5px solid var(--border); } .btn-outline:hover { background: var(--green-pale); }
        .btn-danger { background: var(--red); color: white; } .btn-danger:hover { background: #a93226; }
        .btn-sm { padding: 6px 12px; font-size: 13px; }
        .stat-row { display: flex; gap: 16px; padding: 20px 24px 0; flex-wrap: wrap; }
        .stat { background: var(--card); border-radius: 12px; padding: 16px 20px; flex: 1; min-width: 140px; border: 1px solid var(--border); }
        .stat-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .stat-value { font-size: 28px; font-weight: 700; color: var(--green); margin-top: 4px; font-family: 'Playfair Display', serif; }
        .stat-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .toolbar { display: flex; gap: 10px; padding: 16px 24px; flex-wrap: wrap; align-items: center; }
        .search { flex: 1; min-width: 200px; padding: 10px 14px; border-radius: 8px; border: 1.5px solid var(--border); font-family: inherit; font-size: 14px; background: white; outline: none; }
        .search:focus { border-color: var(--green-light); }
        .filter-btn { padding: 9px 16px; border-radius: 8px; border: 1.5px solid var(--border); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; background: white; color: #333; transition: all 0.15s; }
        .filter-btn.active { background: var(--green); color: white; border-color: var(--green); }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; padding: 0 24px 24px; }
        .card { background: var(--card); border-radius: 14px; border: 1px solid var(--border); padding: 18px; cursor: pointer; transition: all 0.15s; }
        .card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .card.inactive { opacity: 0.6; }
        .card-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .card-addr { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; }
        .card-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
        .price-tag { font-size: 18px; font-weight: 700; color: var(--green); font-family: 'Playfair Display', serif; }
        .lot-pill { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; background: var(--green-pale); color: var(--green); text-transform: uppercase; }
        .badge { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
        .badge.green { background: #d4edda; color: #1a6b2a; } .badge.yellow { background: #fff3cd; color: #856404; }
        .badge.red { background: #f8d7da; color: #842029; } .badge.gray { background: #e9ecef; color: #495057; }
        .empty { text-align: center; padding: 60px 24px; color: var(--text-muted); }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .panel { max-width: 560px; margin: 24px auto; background: var(--card); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
        .panel-header { background: var(--green); color: white; padding: 20px 24px; }
        .panel-title { font-size: 20px; font-weight: 700; font-family: 'Playfair Display', serif; }
        .panel-body { padding: 24px; }
        .detail-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .detail-row:last-child { border-bottom: none; }
        .detail-icon { font-size: 20px; width: 28px; flex-shrink: 0; }
        .detail-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600; }
        .detail-value { font-size: 15px; font-weight: 500; margin-top: 2px; }
        .action-row { display: flex; gap: 10px; flex-wrap: wrap; padding: 0 24px 24px; max-width: 560px; margin: 0 auto; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 6px; }
        .form-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1.5px solid var(--border); font-family: inherit; font-size: 14px; outline: none; }
        .form-input:focus { border-color: var(--green-light); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235a7a5a' stroke-width='2' fill='none'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
        .modal { background: white; border-radius: 16px; padding: 28px; max-width: 380px; width: 100%; }
        .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
        .modal-text { color: var(--text-muted); font-size: 14px; margin-bottom: 24px; }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
        @media (max-width: 480px) { .header { padding: 0 16px; } .stat-row, .toolbar, .card-grid { padding-left: 16px; padding-right: 16px; } .form-row { grid-template-columns: 1fr; } .panel { margin: 16px; } }
      `}</style>

      <div className="header">
        <div className="logo"><span>🌿</span> Entorno Verde</div>
        {view === "list" && <button className="btn btn-white" onClick={openAdd}>+ Add Customer</button>}
        {view !== "list" && <button className="btn btn-white btn-sm" onClick={() => setView("list")}>← Back</button>}
      </div>

      {view === "list" && <>
        <div className="stat-row">
          <div className="stat"><div className="stat-label">Total Customers</div><div className="stat-value">{customers.length}</div><div className="stat-sub">{customers.filter(c => c.status === "active").length} active</div></div>
          <div className="stat"><div className="stat-label">Weekly Revenue</div><div className="stat-value">${totalRevenue}</div><div className="stat-sub">from active clients</div></div>
          <div className="stat"><div className="stat-label">Due for Mow</div><div className="stat-value" style={{ color: dueCount > 0 ? "var(--red)" : "var(--green)" }}>{dueCount}</div><div className="stat-sub">14+ days since last mow</div></div>
        </div>
        <div className="toolbar">
          <input className="search" placeholder="🔍  Search by name or address..." value={search} onChange={e => setSearch(e.target.value)} />
          {["all", "active", "inactive"].map(s => (
            <button key={s} className={`filter-btn${filterStatus === s ? " active" : ""}`} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {filtered.length === 0
          ? <div className="empty"><div className="empty-icon">🌱</div><div>No customers found.</div></div>
          : <div className="card-grid">
            {filtered.map(c => (
              <div key={c.id} className={`card${c.status === "inactive" ? " inactive" : ""}`} onClick={() => openDetail(c)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="card-name">{c.name}</div>
                  <span className="lot-pill">{c.lotSize}</span>
                </div>
                <div className="card-addr">📍 {c.address}</div>
                <div className="card-row">
                  <span className="price-tag">${c.price}</span>
                  <Badge days={daysSince(c.lastMowed)} />
                </div>
              </div>
            ))}
          </div>
        }
      </>}

      {view === "detail" && selected && (() => {
        const c = customers.find(x => x.id === selected.id) || selected;
        return <>
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">{c.name}</div>
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{c.status === "active" ? "✅ Active" : "⏸ Inactive"}</div>
            </div>
            <div className="panel-body">
              <div className="detail-row"><span className="detail-icon">📍</span><div><div className="detail-label">Address</div><div className="detail-value">{c.address}</div></div></div>
              <div className="detail-row"><span className="detail-icon">📞</span><div><div className="detail-label">Phone</div><div className="detail-value">{c.phone || "—"}</div></div></div>
              <div className="detail-row"><span className="detail-icon">🌿</span><div><div className="detail-label">Lot Size</div><div className="detail-value">{c.lotSize}</div></div></div>
              <div className="detail-row"><span className="detail-icon">💵</span><div><div className="detail-label">Price per Mow</div><div className="detail-value">${c.price}</div></div></div>
              <div className="detail-row">
                <span className="detail-icon">🗓</span>
                <div><div className="detail-label">Last Mowed</div>
                  <div className="detail-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {c.lastMowed || "Never"} <Badge days={daysSince(c.lastMowed)} />
                  </div>
                </div>
              </div>
              {c.notes && <div className="detail-row"><span className="detail-icon">📝</span><div><div className="detail-label">Notes</div><div className="detail-value">{c.notes}</div></div></div>}
            </div>
          </div>
          <div className="action-row">
            <button className="btn btn-primary" onClick={() => markMowed(c.id)}>✅ Mark as Mowed Today</button>
            <button className="btn btn-outline" onClick={() => openEdit(c)}>✏️ Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(c)}>🗑 Delete</button>
          </div>
        </>;
      })()}

      {view === "form" && (
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">{editingId ? "Edit Customer" : "New Customer"}</div>
          </div>
          <div className="panel-body">
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" placeholder="e.g. Maria González" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Address *</label><input className="form-input" placeholder="e.g. 123 Oak Street" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" placeholder="787-555-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Lot Size</label><select className="form-input form-select" value={form.lotSize} onChange={e => setForm(f => ({ ...f, lotSize: e.target.value }))}>{LOT_SIZES.map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Price ($)</label><input className="form-input" type="number" placeholder="45" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Last Mowed</label><input className="form-input" type="date" value={form.lastMowed} onChange={e => setForm(f => ({ ...f, lastMowed: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Status</label><select className="form-input form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" rows={3} placeholder="e.g. Has a dog, mow every 2 weeks..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: "vertical" }} /></div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={saveForm} disabled={!form.name.trim() || !form.address.trim()}>{editingId ? "Save Changes" : "Add Customer"}</button>
              <button className="btn btn-outline" onClick={() => setView(editingId ? "detail" : "list")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-title">Delete Customer?</div>
            <div className="modal-text">Are you sure you want to remove <strong>{confirmDelete.name}</strong>? This cannot be undone.</div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteCustomer(confirmDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
