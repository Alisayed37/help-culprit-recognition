import axios from 'axios'

// Central axios instance for the whole app.
// .NET API base URL — must match the running backend port.
export const API_BASE = 'http://localhost:5011'

const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
})

// Attach the JWT (saved at login) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, the session is dead — wipe storage and bounce to the login page.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
