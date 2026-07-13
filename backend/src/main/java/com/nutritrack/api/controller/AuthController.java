package com.nutritrack.api.controller;

import com.nutritrack.api.config.JwtUtils;
import com.nutritrack.api.config.UserDetailsImpl;
import com.nutritrack.api.dto.JwtResponse;
import com.nutritrack.api.dto.LoginRequest;
import com.nutritrack.api.dto.RegisterRequest;
import com.nutritrack.api.model.*;
import com.nutritrack.api.repository.RoleRepository;
import com.nutritrack.api.repository.UserRepository;
import com.nutritrack.api.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ProfileService profileService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Fetch user name
        String name = profileService.getProfileByUserId(userDetails.getId()) != null 
                ? profileService.getProfileByUserId(userDetails.getId()).getName() 
                : userDetails.getUsername();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                name,
                roles));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);
        user.setRoles(roles);

        // Save user
        User savedUser = userRepository.save(user);

        // Save profile
        UserProfile profile = new UserProfile();
        profile.setName(signUpRequest.getName());
        profile.setMobile(signUpRequest.getMobile());
        profile.setAge(signUpRequest.getAge() != null ? signUpRequest.getAge() : 30);
        profile.setGender(signUpRequest.getGender() != null ? signUpRequest.getGender() : "MALE");
        profile.setHeight(signUpRequest.getHeight() != null ? signUpRequest.getHeight() : 175.0);
        profile.setWeight(signUpRequest.getWeight() != null ? signUpRequest.getWeight() : 70.0);
        profile.setTargetWeight(signUpRequest.getTargetWeight() != null ? signUpRequest.getTargetWeight() : profile.getWeight());
        profile.setActivityLevel(signUpRequest.getActivityLevel() != null ? signUpRequest.getActivityLevel() : "SEDENTARY");
        profile.setGoal(signUpRequest.getGoal() != null ? signUpRequest.getGoal() : "MAINTAIN");

        profileService.saveProfile(profile, savedUser);

        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (userRepository.existsByEmail(email)) {
            // In production, send email reset link. In this portfolio, mock response success.
            return ResponseEntity.ok(Map.of("message", "Password reset instructions sent to " + email));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Error: Email not found."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        // Mock response
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Please log in."));
    }
}
