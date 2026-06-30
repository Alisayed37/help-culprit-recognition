import { useEffect, useState, useRef } from 'react'
import apiClient, { API_BASE } from '../api/apiClient'

function ImagesPage({ investigationId }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')
  const fileInputRef = useRef(null)

  const loadImages = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get(`/image/list/${investigationId}`)
      setImages(res.data)
    } catch (err) {
      setStatus(err.response?.data?.error || 'Failed to load images.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (investigationId) loadImages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investigationId])

  // Upload in batches so a single request never grows too large, then build the
  // vector index once at the end. This keeps large bulk uploads (thousands of
  // images) reliable.
  const BATCH_SIZE = 500

  const handleUpload = async (e) => {
    const all = Array.from(e.target.files || [])
    if (all.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let start = 0; start < all.length; start += BATCH_SIZE) {
        const slice = all.slice(start, start + BATCH_SIZE)
        const formData = new FormData()
        formData.append('investigationId', investigationId)
        formData.append('runIndex', 'false') // defer indexing until all batches are uploaded
        slice.forEach((f) => formData.append('images', f))

        setStatus(`Uploading ${Math.min(start + slice.length, all.length)} of ${all.length} images...`)

        await apiClient.post('/image/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (evt) => {
            if (evt.total) {
              const frac = evt.loaded / evt.total
              const overall = ((start + frac * slice.length) / all.length) * 100
              setUploadProgress(Math.round(overall))
            }
          },
        })
      }

      // All files saved — now build the vector index once.
      setUploadProgress(100)
      setStatus(`Building vector index for ${all.length} images... this can take a while.`)
      await apiClient.post(`/image/index/${investigationId}`)

      setStatus(`Upload complete. ${all.length} images indexed.`)
      await loadImages()
    } catch (err) {
      setStatus(err.response?.data?.detail || err.response?.data?.error || 'Upload failed.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (imageId) => {
    if (!confirm('Delete this image?')) return
    try {
      await apiClient.delete(`/image/${imageId}`)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (err) {
      setStatus(err.response?.data?.error || 'Delete failed.')
    }
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <h2>Evidence Images</h2>
        <div className="toolbar-actions">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            style={{ display: 'none' }}
            id="image-upload-input"
          />
          <label htmlFor="image-upload-input" className="btn btn-primary">
            {uploading ? 'Uploading...' : '+ Upload Images'}
          </label>
        </div>
      </div>

      {uploading && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
          <span className="progress-label">{uploadProgress}%</span>
        </div>
      )}

      {status && <p className="status-msg">{status}</p>}

      {loading ? (
        <p className="muted">Loading images...</p>
      ) : images.length === 0 ? (
        <p className="muted">No images uploaded yet.</p>
      ) : (
        <div className="image-grid">
          {images.map((img) => (
            <div key={img.id} className="image-card">
              <img
                src={`${API_BASE}/images/${investigationId}/images/${img.fileName}`}
                alt={img.fileName}
                onError={(e) => {
                  e.target.src =
                    'data:image/svg+xml;charset=utf-8,' +
                    encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#0f1b33"/><text x="50%" y="50%" fill="#6c7a99" font-size="12" text-anchor="middle">No Image</text></svg>'
                    )
                }}
              />
              <div className="image-card-footer">
                <span className="image-name" title={img.fileName}>
                  {img.fileName}
                </span>
                <button className="icon-btn danger" onClick={() => handleDelete(img.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImagesPage
