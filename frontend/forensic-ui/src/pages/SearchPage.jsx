import { useState, useRef } from 'react'
import apiClient, { API_BASE } from '../api/apiClient'

// Facial feature sliders. Each maps a certainty (0-100%) to a text fragment
// that gets appended to the query when the slider is above a threshold.
const FEATURES = [
  { key: 'glasses', label: 'Glasses', phrase: 'wearing glasses' },
  { key: 'beard', label: 'Beard', phrase: 'with a beard' },
  { key: 'mustache', label: 'Mustache', phrase: 'with a mustache' },
  { key: 'hat', label: 'Hat', phrase: 'wearing a hat' },
  { key: 'bald', label: 'Bald', phrase: 'bald' },
  { key: 'young', label: 'Young', phrase: 'a young person' },
  { key: 'old', label: 'Old', phrase: 'an elderly person' },
]

const FEATURE_THRESHOLD = 50 // only include a feature once its slider passes 50%

function SearchPage({ investigationId }) {
  const [mode, setMode] = useState('text') // 'text' | 'image'
  const [query, setQuery] = useState('')
  const [model, setModel] = useState('epoch_3')
  const [metric, setMetric] = useState('cosine')
  const [topK, setTopK] = useState(5)
  const [weights, setWeights] = useState(
    FEATURES.reduce((acc, f) => ({ ...acc, [f.key]: 0 }), {})
  )
  const [queryImage, setQueryImage] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const imageInputRef = useRef(null)

  const setWeight = (key, value) =>
    setWeights((prev) => ({ ...prev, [key]: Number(value) }))

  // Build the final query string by appending high-certainty features.
  const buildQuery = () => {
    const active = FEATURES.filter((f) => weights[f.key] >= FEATURE_THRESHOLD).map(
      (f) => f.phrase
    )
    const base = query.trim()
    if (active.length === 0) return base
    return [base, ...active].filter(Boolean).join(', ')
  }

  const handleTextSearch = async () => {
    const finalQuery = buildQuery()
    if (!finalQuery) {
      setStatus('Enter a description or adjust the feature sliders.')
      return
    }

    setLoading(true)
    setStatus(`Searching for: "${finalQuery}"`)
    try {
      const res = await apiClient.post('/search/text', {
        investigationId: parseInt(investigationId, 10),
        query: finalQuery,
        model,
        metric,
        topK: Number(topK),
      })
      setResults(res.data.matches || [])
      setStatus(`Found ${res.data.matches?.length || 0} matches.`)
    } catch (err) {
      setStatus(err.response?.data?.error || 'Search failed. Did you upload & index images?')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageSearch = async () => {
    if (!queryImage) {
      setStatus('Select a query image first.')
      return
    }

    const formData = new FormData()
    formData.append('investigationId', investigationId)
    formData.append('queryImage', queryImage)
    formData.append('model', model)
    formData.append('metric', metric)
    formData.append('topK', String(topK))

    setLoading(true)
    setStatus('Running image-to-image search...')
    try {
      const res = await apiClient.post('/search/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResults(res.data.matches || [])
      setStatus(`Found ${res.data.matches?.length || 0} matches.`)
    } catch (err) {
      setStatus(err.response?.data?.error || 'Image search failed.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'text') handleTextSearch()
    else handleImageSearch()
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <h2>Suspect Search</h2>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
            onClick={() => setMode('text')}
          >
            Text Search
          </button>
          <button
            className={`mode-btn ${mode === 'image' ? 'active' : ''}`}
            onClick={() => setMode('image')}
          >
            Image Search
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="search-panel">
        {mode === 'text' ? (
          <input
            type="text"
            className="search-input"
            placeholder="Describe the suspect (e.g., 'A man with a goatee')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        ) : (
          <div className="image-search-pick">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              id="query-image-input"
              style={{ display: 'none' }}
              onChange={(e) => setQueryImage(e.target.files?.[0] || null)}
            />
            <label htmlFor="query-image-input" className="btn btn-secondary">
              Choose Query Image
            </label>
            <span className="muted small">
              {queryImage ? queryImage.name : 'No image selected'}
            </span>
          </div>
        )}

        <div className="search-options">
          <div className="option">
            <label>Model Version</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="epoch_0">Epoch 0 (Pre-trained)</option>
              <option value="epoch_3">Epoch 3 (Recommended)</option>
              <option value="epoch_4">Epoch 4</option>
              <option value="epoch_6">Epoch 6 (Best)</option>
              <option value="epoch_8">Epoch 8</option>
            </select>
          </div>
          <div className="option">
            <label>Distance Metric</label>
            <select value={metric} onChange={(e) => setMetric(e.target.value)}>
              <option value="cosine">Cosine Similarity</option>
              <option value="euclidean">Euclidean Distance</option>
            </select>
          </div>
          <div className="option">
            <label>Results</label>
            <select value={topK} onChange={(e) => setTopK(Number(e.target.value))}>
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {mode === 'text' && (
          <div className="feature-weights">
            <h4>Certainty Weighting</h4>
            <p className="muted small">
              Sliders above {FEATURE_THRESHOLD}% append their trait to the query.
            </p>
            <div className="sliders-grid">
              {FEATURES.map((f) => (
                <div key={f.key} className="slider-row">
                  <div className="slider-head">
                    <span>{f.label}</span>
                    <span
                      className={`slider-pct ${
                        weights[f.key] >= FEATURE_THRESHOLD ? 'on' : ''
                      }`}
                    >
                      {weights[f.key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights[f.key]}
                    onChange={(e) => setWeight(f.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      {status && <p className="status-msg">{status}</p>}

      <div className="results-grid">
        {results.map((res, idx) => {
          const pct = Math.max(0, res.matchScore * 100).toFixed(1)
          return (
            <div key={idx} className="result-card">
              <img
                src={`${API_BASE}/images/${investigationId}/images/${res.filename}`}
                alt={res.filename}
                onError={(e) => {
                  e.target.src =
                    'data:image/svg+xml;charset=utf-8,' +
                    encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#0f1b33"/><text x="50%" y="50%" fill="#6c7a99" font-size="12" text-anchor="middle">No Image</text></svg>'
                    )
                }}
              />
              <div className="result-info">
                <div className="match-badge">Match: {pct}%</div>
                <span className="result-name" title={res.filename}>
                  {res.filename}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SearchPage
