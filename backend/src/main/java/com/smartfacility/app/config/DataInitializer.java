package com.smartfacility.app.config;

import com.smartfacility.app.model.ERole;
import com.smartfacility.app.model.Role;
import com.smartfacility.app.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        for (ERole eRole : ERole.values()) {
            if (roleRepository.findByName(eRole).isEmpty()) {
                roleRepository.save(new Role(eRole));
                System.out.println("  ✓ Created role: " + eRole.name());
            }
        }
        System.out.println("  ✓ Role initialization complete");
    }
}
