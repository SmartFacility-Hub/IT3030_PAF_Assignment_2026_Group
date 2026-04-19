package com.smartfacility.app.controller;

import com.smartfacility.app.model.Facility;
import com.smartfacility.app.model.FacilityStatus;
import com.smartfacility.app.model.FacilityType;
import com.smartfacility.app.service.FacilityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    // ── Helper: Facility → response Map (matches your existing style) ──

    private Map<String, Object> toResponse(Facility f) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",                f.getId());
        map.put("name",              f.getName());
        map.put("type",              f.getType());
        map.put("capacity",          f.getCapacity());
        map.put("location",          f.getLocation());
        map.put("description",       f.getDescription());
        map.put("status",            f.getStatus());
        map.put("availabilityStart", f.getAvailabilityStart());
        map.put("availabilityEnd",   f.getAvailabilityEnd());
        map.put("createdAt",         f.getCreatedAt());
        map.put("updatedAt",         f.getUpdatedAt());
        return map;
    }

    /**
     * GET /api/facilities
     * All authenticated users can search & filter.
     * Optional query params: type, status, location, minCapacity
     * Example: /api/facilities?type=LAB&status=ACTIVE&location=BlockA&minCapacity=30
     */
    @GetMapping
    public ResponseEntity<?> getAllFacilities(
            @RequestParam(required = false) FacilityType   type,
            @RequestParam(required = false) FacilityStatus status,
            @RequestParam(required = false) String         location,
            @RequestParam(required = false) Integer        minCapacity) {

        List<Map<String, Object>> result = facilityService
                .searchFacilities(type, status, location, minCapacity)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/facilities/{id}
     * Get single facility — all authenticated users.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFacilityById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(facilityService.getFacilityById(id)));
    }

    /**
     * POST /api/facilities
     * Create facility — ADMIN only.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createFacility(@Valid @RequestBody Facility facility) {
        Facility created = facilityService.createFacility(facility);
        Map<String, Object> response = toResponse(created);
        response.put("message", "Facility created successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/facilities/{id}
     * Update facility — ADMIN only.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateFacility(@PathVariable Long id,
                                             @Valid @RequestBody Facility facility) {
        Facility updated = facilityService.updateFacility(id, facility);
        Map<String, Object> response = toResponse(updated);
        response.put("message", "Facility updated successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/facilities/{id}
     * Delete facility — ADMIN only.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFacility(@PathVariable Long id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.ok(Map.of("message", "Facility deleted successfully"));
    }
}