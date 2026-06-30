import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/apiClient'
import Sidebar from '../components/Sidebar'
import ImagesPage from './ImagesPage'
import SearchPage from './SearchPage'

function DashboardPage() {
  const navigate = useNavigate()
  const [investigations, setInvestigations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [activeTab, setActiveTab] = useState('images') // 'images' | 'search'
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [error, setError] = useState('')

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  })()

  const loadInvestigations = async () => {
    try {
      const res = await apiClient.get('/investigation/list')
      setInvestigations(res.data)
      if (res.data.length > 0 && selectedId == null) {
        setSelectedId(res.data[0].id)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load investigations.')
    }
  }

  useEffect(() => {
    loadInvestigations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      const res = await apiClient.post('/investigation/create', {
        title: newTitle,
        description: newDescription,
      })
      setShowModal(false)
      setNewTitle('')
      setNewDescription('')
      await loadInvestigations()
      setSelectedId(res.data.id)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create investigation.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this investigation and all its evidence?')) return
    try {
      await apiClient.delete(`/investigation/${id}`)
      const remaining = investigations.filter((i) => i.id !== id)
      setInvestigations(remaining)
      if (selectedId === id) {
        setSelectedId(remaining.length > 0 ? remaining[0].id : null)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete investigation.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const selected = investigations.find((i) => i.id === selectedId)

  return (
    <div className="dashboard">
      <Sidebar
        investigations={investigations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNew={() => setShowModal(true)}
        onDelete={handleDelete}
        username={user.username}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {error && <div className="banner-error">{error}</div>}

        {!selected ? (
          <div className="empty-state">
            <h2>No investigation selected</h2>
            <p className="muted">
              Create a new investigation or select one from the sidebar to begin.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + New Investigation
            </button>
          </div>
        ) : (
          <>
            <div className="content-header">
              <div>
                <h1>{selected.title}</h1>
                {selected.description && (
                  <p className="muted">{selected.description}</p>
                )}
              </div>
              <div className="tab-nav">
                <button
                  className={`tab ${activeTab === 'images' ? 'active' : ''}`}
                  onClick={() => setActiveTab('images')}
                >
                  Images
                </button>
                <button
                  className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                  onClick={() => setActiveTab('search')}
                >
                  Search
                </button>
              </div>
            </div>

            {activeTab === 'images' ? (
              <ImagesPage investigationId={selected.id} />
            ) : (
              <SearchPage investigationId={selected.id} />
            )}
          </>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Investigation</h2>
            <form onSubmit={handleCreate}>
              <label>Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Downtown Bank Case"
                autoFocus
              />
              <label>Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optional case notes"
                rows={3}
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
