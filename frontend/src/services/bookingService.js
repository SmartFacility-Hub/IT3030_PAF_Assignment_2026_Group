import api from './api';

// BACKEND: POST /api/bookings — BookingController.createBooking()
export const createBooking = (data) => api.post('/api/bookings', data);

// BACKEND: GET /api/bookings/my — BookingController.getMyBookings()
export const getMyBookings = () => api.get('/api/bookings/my');

// BACKEND: GET /api/bookings — BookingController.getAllBookings()
export const getAllBookings = (params) => api.get('/api/bookings', { params });

// BACKEND: GET /api/bookings/{id} — BookingController.getBookingById()
export const getBookingById = (id) => api.get(`/api/bookings/${id}`);

// BACKEND: PUT /api/bookings/{id}/approve — BookingController.approveBooking()
export const approveBooking = (id) => api.put(`/api/bookings/${id}/approve`);

// BACKEND: PUT /api/bookings/{id}/reject — BookingController.rejectBooking()
export const rejectBooking = (id, reason) => api.put(`/api/bookings/${id}/reject`, { reason });

// BACKEND: PUT /api/bookings/{id}/cancel — BookingController.cancelBooking()
export const cancelBooking = (id) => api.put(`/api/bookings/${id}/cancel`);
