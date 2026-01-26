import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Permettre l'envoi des cookies
  headers: {
    'Content-Type': 'application/json'
  }
})

// Plus besoin d'intercepteur request car le token est dans les cookies httpOnly
// L'intercepteur est supprimé car Axios envoie automatiquement les cookies avec withCredentials: true

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ne plus supprimer authToken car il n'est plus en localStorage
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  logout: () => api.post('/users/logout'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  getAllUsers: () => api.get('/users/admin/users')
}

export const notesAPI = {
  getAllNotes: () => api.get('/notes'),
  getAllNotesFromProject: (projectId) => api.get(`/notes/project/${projectId}`),
  getNoteById: (id) => api.get(`/notes/note/${id}`),
  createNote: (noteData) => api.post('/notes/note', noteData),
  updateNote: (id, noteData) => api.put(`/notes/note/${id}`, noteData),
  deleteNote: (id) => api.delete(`/notes/note/${id}`),
}

export const projectsAPI = {
  getAllProjects: () => api.get('/projects'),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  
  // Gestion des membres
  getProjectMembers: (projectId) => api.get(`/projects/${projectId}/members`),
  addProjectMember: (projectId, memberData) => api.post(`/projects/${projectId}/members`, memberData),
  removeProjectMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
  updateMemberRole: (projectId, userId, roleData) => api.put(`/projects/${projectId}/members/${userId}`, roleData)
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
  getNoteShares: (noteId) => api.get(`/share/note/${noteId}`),
}

export const commentsAPI = {
  createComment: (noteId, commentData) => api.post(`/comments/note/${noteId}`, commentData),
  getComments: (noteId) => api.get(`/comments/note/${noteId}`),
  getComment: (commentId) => api.get(`/comments/${commentId}`),
  updateComment: (commentId, commentData) => api.put(`/comments/${commentId}`, commentData),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
}

export const profileAPI = {
  getUserProfile: () => api.get('/users/profile'),
  getUserProfileWithStats: () => api.get('/users/profile/stats'),
  updateUserProfile: (profileData) => api.put('/users/profile', profileData)
}

// API pour l'administration des utilisateurs
export const adminAPI = {
  getAllUsers: () => api.get('/users/admin/users'),
  updateUserRole: (userId, roleId) => api.put('/users/admin/users/role', { userId, roleId }),
  deleteUser: (userId) => api.delete(`/users/admin/users/${userId}`)
}

export default api