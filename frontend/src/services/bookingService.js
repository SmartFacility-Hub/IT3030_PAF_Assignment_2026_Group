import axios from 'axios';

/**
 * Axios instance for the Spring Boot API.
 * Set REACT_APP_API_URL in .env when the UI is not served from the same origin as the API
 * (e.g. REACT_APP_API_URL=http://localhost:8080).
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// POST /api/bookings — Create a new booking request
export const createBooking = (bookingData) => api.post('/api/bookings', bookingData);

// GET /api/bookings/my — Get bookings for the logged-in user
export const getMyBookings = () => api.get('/api/bookings/my');

// GET /api/bookings — Admin: get all bookings (with optional filters)
export const getAllBookings = (filters) => api.get('/api/bookings', { params: filters });

// GET /api/bookings/{id} — Get a single booking by ID
export const getBookingById = (id) => api.get(`/api/bookings/${id}`);

// PUT /api/bookings/{id}/approve — Admin approves a booking
export const approveBooking = (id) => api.put(`/api/bookings/${id}/approve`);

// PUT /api/bookings/{id}/reject — Admin rejects a booking with a reason
export const rejectBooking = (id, reason) => api.put(`/api/bookings/${id}/reject`, { reason });

// PUT /api/bookings/{id}/cancel — User cancels their own booking
export const cancelBooking = (id) => api.put(`/api/bookings/${id}/cancel`);
