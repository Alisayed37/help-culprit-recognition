// Left navigation: investigation list, create + delete controls.
function Sidebar({
  investigations,
  selectedId,
  onSelect,
  onNew,
  onDelete,
  username,
  onLogout,
}) {
  const formatDate = (iso) => {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString()
    } catch {
      return ''
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-mark">⚖</span>
          <span className="brand-text">Forensic AI</span>
        </div>
        {username && <div className="sidebar-user">Agent: {username}</div>}
      </div>

      <button className="btn btn-primary btn-block" onClick={onNew}>
        + New Investigation
      </button>

      <div className="investigation-list">
        {investigations.length === 0 && (
          <p className="muted small">No investigations yet.</p>
        )}
        {investigations.map((inv) => (
          <div
            key={inv.id}
            className={`investigation-item ${selectedId === inv.id ? 'active' : ''}`}
            onClick={() => onSelect(inv.id)}
          >
            <div className="investigation-meta">
              <span className="investigation-title">{inv.title}</span>
              <span className="investigation-date">{formatDate(inv.createdAt)}</span>
            </div>
            <button
              className="icon-btn"
              title="Delete investigation"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(inv.id)
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost btn-block logout-btn" onClick={onLogout}>
        Sign Out
      </button>
    </aside>
  )
}

export default Sidebar
