import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

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
  getAllNotes: () => api.get('/notes/'),
  getNoteById: (id) => api.get(`/notes/note/${id}`),
  createNote: (noteData) => api.post('/notes/note', noteData),
  updateNote: (id, noteData) => api.put(`/notes/note/${id}`, noteData),
  deleteNote: (id) => api.delete(`/notes/note/${id}`),
  searchNotes: (query, projectId) => {
    const params = new URLSearchParams({ q: query })
    if (projectId) params.append('projectId', projectId)
    return api.get(`/notes/search?${params}`)
  },
  getFilteredNotes: (filters) => {
    const params = new URLSearchParams(filters)
    return api.get(`/notes/filter?${params}`)
  },
  getAllAccessibleNotes: () => api.get('/share/accessible')
}

export const projectsAPI = {
  getAllProjects: () => api.get('/projects'),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`)
}

export const tagsAPI = {
  getAllTags: () => api.get('/tags'),
  getTagById: (id) => api.get(`/tags/${id}`),
  createTag: (tagData) => api.post('/tags', tagData),
  updateTag: (id, tagData) => api.put(`/tags/${id}`, tagData),
  deleteTag: (id) => api.delete(`/tags/${id}`),
  addTagToNote: (noteId, tagId) => api.post(`/tags/note/${noteId}/tag/${tagId}`),
  removeTagFromNote: (noteId, tagId) => api.delete(`/tags/note/${noteId}/tag/${tagId}`),
  getNoteTags: (noteId) => api.get(`/tags/note/${noteId}`),
  getNotesByTag: (tagId) => api.get(`/tags/${tagId}/notes`)
}

export const shareAPI = {
  shareNote: (noteId, shareData) => api.post(`/share/note/${noteId}`, shareData),
  unshareNote: (noteId, userId) => api.delete(`/share/note/${noteId}/user/${userId}`),
  updateSharePermission: (noteId, userId, permissionData) => api.put(`/share/note/${noteId}/user/${userId}`, permissionData),
  getSharedNotes: () => api.get('/share/notes'),
  getNoteShares: (noteId) => api.get(`/share/note/${noteId}`)
}

export const commentsAPI = {
  createComment: (noteId, commentData) => api.post(`/comments/note/${noteId}`, commentData),
  getComments: (noteId) => api.get(`/comments/note/${noteId}`),
  getComment: (commentId) => api.get(`/comments/${commentId}`),
  updateComment: (commentId, commentData) => api.put(`/comments/${commentId}`, commentData),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  getRecentComments: (limit = 10) => api.get(`/comments/recent?limit=${limit}`)
}

export const profileAPI = {
  getUserProfile: () => api.get('/profile'),
  getUserProfileWithStats: () => api.get('/profile/stats'),
  updateUserProfile: (profileData) => api.put('/profile', profileData)
}

// API pour l'administration des utilisateurs
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, roleId) => api.put('/admin/users/role', { userId, roleId }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`)
}

export default api