package com.skillstorm.hotelreservationsystem.services;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.skillstorm.hotelreservationsystem.repositories.EmployeeRepository;

/**
 * Service class that implements Spring Security's UserDetailsService for employee authentication.
 * <p>
 * This service loads employee details from the database by email address for use in
 * Spring Security's authentication mechanism. It is used for employee login via Basic Auth.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Service
public class EmployeeUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    /**
     * Constructs a new EmployeeUserDetailsService with the required repository.
     *
     * @param employeeRepository The repository for employee data access.
     */
    public EmployeeUserDetailsService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    /**
     * Loads an employee by email address for authentication purposes.
     *
     * @param email The email address of the employee (used as username).
     * @return The UserDetails object containing employee authentication information.
     * @throws UsernameNotFoundException if no employee is found with the specified email.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Employee not found: " + email)
                );
    }
}
