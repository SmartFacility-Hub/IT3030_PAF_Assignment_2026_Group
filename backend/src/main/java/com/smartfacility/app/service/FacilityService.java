package com.smartfacility.app.service;

import com.smartfacility.app.model.Facility;
import com.smartfacility.app.model.FacilityStatus;
import com.smartfacility.app.model.FacilityType;
import com.smartfacility.app.repository.FacilityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    // ── READ ──

    public List<Facility> searchFacilities(FacilityType type,
                                           FacilityStatus status,
                                           String location,
                                           Integer minCapacity) {
        return facilityRepository.findAll()
                .stream()
                .filter(f -> type == null        || f.getType().equals(type))
                .filter(f -> status == null      || f.getStatus().equals(status))
                .filter(f -> location == null    || f.getLocation().toLowerCase()
                                                     .contains(location.toLowerCase()))
                .filter(f -> minCapacity == null || f.getCapacity() >= minCapacity)
                .toList();
    }

    public Facility getFacilityById(Long id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Facility not found with id: " + id));
    }

    // ── CREATE ──

    public Facility createFacility(Facility facility) {
        return facilityRepository.save(facility);
    }

    // ── UPDATE ──

    public Facility updateFacility(Long id, Facility updated) {
        Facility existing = getFacilityById(id);

        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setCapacity(updated.getCapacity());
        existing.setLocation(updated.getLocation());
        existing.setDescription(updated.getDescription());
        existing.setStatus(updated.getStatus());
        existing.setAvailabilityStart(updated.getAvailabilityStart());
        existing.setAvailabilityEnd(updated.getAvailabilityEnd());

        return facilityRepository.save(existing);
    }

    // ── DELETE ──

    public void deleteFacility(Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Facility not found with id: " + id);
        }
        facilityRepository.deleteById(id);
    }
}