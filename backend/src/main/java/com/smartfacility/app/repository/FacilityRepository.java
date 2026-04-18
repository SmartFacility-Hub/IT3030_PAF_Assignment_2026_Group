package com.smartfacility.app.repository;

import com.smartfacility.app.model.Facility;
import com.smartfacility.app.model.FacilityStatus;
import com.smartfacility.app.model.FacilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    List<Facility> findByType(FacilityType type);
    List<Facility> findByStatus(FacilityStatus status);
    List<Facility> findByTypeAndStatus(FacilityType type, FacilityStatus status);
    List<Facility> findByLocationContainingIgnoreCase(String location);
    List<Facility> findByCapacityGreaterThanEqual(Integer minCapacity);
}