import api from "./api";

// BACKEND: GET /api/facilities — FacilityController.getAllFacilities()
// CONNECTS TO: FacilityController.java → FacilityService.java
export const getAllFacilities = () => api.get("/api/facilities");

// BACKEND: GET /api/facilities/{id} — FacilityController.getFacilityById()
// CONNECTS TO: FacilityController.java → FacilityService.java
export const getFacilityById = (id) => api.get(`/api/facilities/${id}`);

const facilityService = {
  // Named exports above (also available here for backward compatibility)
  getAllFacilities,
  getFacilityById,

  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type)        params.append("type",        filters.type);
    if (filters.status)      params.append("status",      filters.status);
    if (filters.location)    params.append("location",    filters.location);
    if (filters.minCapacity) params.append("minCapacity", filters.minCapacity);
    return api.get(`/api/facilities?${params.toString()}`);
  },

  getById: (id) => api.get(`/api/facilities/${id}`),

  create: (data) => api.post("/api/facilities", data),

  update: (id, data) => api.put(`/api/facilities/${id}`, data),

  delete: (id) => api.delete(`/api/facilities/${id}`),
};

export default facilityService;