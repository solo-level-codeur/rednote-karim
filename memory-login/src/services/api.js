import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api/notes'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  getProfile: () => api.get('/profile')
}

export const notesAPI = {
  getAllNotes: () => api.get('/'),
  getNoteById: (id) => api.get(`/note/${id}`),
  createNote: (noteData) => api.post('/note', noteData),
  updateNote: (id, noteData) => api.put(`/note/${id}`, noteData),
  deleteNote: (id) => api.delete(`/note/${id}`)
}

export default api