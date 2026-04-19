import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on home page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// ── Ticket API helpers ──────────────────────────────────────────────────────
export const ticketApi = {
  // Fetch all tickets (optionally filtered by status)
  fetchAll: (status) =>
    api.get('/api/tickets', status ? { params: { status } } : {}),

  // Create a new ticket
  create: (dto) => api.post('/api/tickets', dto),

  // Get one ticket by id
  getById: (id) => api.get(`/api/tickets/${id}`),

  // Permanently delete ticket (admin only; backend allows CLOSED or REJECTED)
  delete: (id) => api.delete(`/api/tickets/${id}`),

  // Update ticket status (+ optional reason / resolutionNotes)
  updateStatus: (id, dto) => api.put(`/api/tickets/${id}/status`, dto),

  // Assign a technician to a ticket (admin only)
  assign: (id, technicianEmail) =>
    api.put(`/api/tickets/${id}/assign`, { technicianId: technicianEmail }),

  // Upload one attachment (call up to 3 times per ticket)
  uploadAttachment: (ticketId, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/api/tickets/${ticketId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Download URL for an attachment (used as <img src>)
  attachmentDownloadUrl: (ticketId, attachmentId) =>
    `${API_BASE_URL}/api/tickets/${ticketId}/attachments/${attachmentId}/download`,

  // Comments
  addComment: (ticketId, content) =>
    api.post(`/api/tickets/${ticketId}/comments`, { content }),

  editComment: (ticketId, commentId, content) =>
    api.put(`/api/tickets/${ticketId}/comments/${commentId}`, { content }),

  deleteComment: (ticketId, commentId) =>
    api.delete(`/api/tickets/${ticketId}/comments/${commentId}`),
};

// ── Admin API helpers ───────────────────────────────────────────────────────
export const adminApi = {
  fetchUsers: () => api.get('/api/admin/users'),
  createUser: (dto) => api.post('/api/admin/users', dto),
  getUser: (userId) => api.get(`/api/admin/users/${userId}`),
  updateUser: (userId, dto) => api.put(`/api/admin/users/${userId}`, dto),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  updateRoles: (userId, roles) => api.put(`/api/admin/users/${userId}/roles`, { roles }),
};

// ── Booking API helpers ──────────────────────────────────────────────────────
export const bookingApi = {
  fetchMine: () => api.get('/api/bookings/my'),
  create: (dto) => api.post('/api/bookings', dto),
  update: (id, dto) => api.put(`/api/bookings/${id}`, dto),
  cancel: (id) => api.put(`/api/bookings/${id}/cancel`),
};

/** Image src for ticket attachments: uses Cloudinary HTTPS from API when present, else local download URL. */
export function resolveAttachmentImageSrc(attachment, ticketId) {
  const u = attachment?.downloadUrl?.trim?.() ?? attachment?.downloadUrl;
  if (u && (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('//'))) {
    return u.startsWith('//') ? `https:${u}` : u;
  }
  const path =
    u && u.startsWith('/')
      ? u
      : `/api/tickets/${ticketId}/attachments/${attachment?.id}/download`;
  return `${API_BASE_URL}${path}`;
}
// ── Auth API helpers ─────────────────────────────────────────────────────────
export const authApi = {
  register: (name, email, password) =>
    api.post('/api/auth/register', { name, email, password }),
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
};

// ── Notification API helpers ─────────────────────────────────────────────────
export const notificationApi = {
  /** Get all notifications (max 50, newest first) */
  fetchAll: () => api.get('/api/notifications'),
  /** Get unread count for badge */
  unreadCount: () => api.get('/api/notifications/unread-count'),
  /** Mark one notification as read */
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
  /** Mark all notifications as read */
  markAllRead: () => api.put('/api/notifications/read-all'),
};

export default api;
export { API_BASE_URL };
