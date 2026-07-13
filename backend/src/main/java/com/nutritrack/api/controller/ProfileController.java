package com.nutritrack.api.controller;

import com.nutritrack.api.config.UserDetailsImpl;
import com.nutritrack.api.model.User;
import com.nutritrack.api.model.UserProfile;
import com.nutritrack.api.repository.UserRepository;
import com.nutritrack.api.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<UserProfile> getProfile() {
        User user = getCurrentUser();
        UserProfile profile = profileService.getProfileByUserId(user.getId());
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<UserProfile> updateProfile(@RequestBody UserProfile updatedProfile) {
        User user = getCurrentUser();
        UserProfile existingProfile = profileService.getProfileByUserId(user.getId());

        if (existingProfile == null) {
            existingProfile = new UserProfile();
        }

        existingProfile.setName(updatedProfile.getName());
        existingProfile.setMobile(updatedProfile.getMobile());
        existingProfile.setAge(updatedProfile.getAge());
        existingProfile.setGender(updatedProfile.getGender());
        existingProfile.setHeight(updatedProfile.getHeight());
        existingProfile.setWeight(updatedProfile.getWeight());
        existingProfile.setTargetWeight(updatedProfile.getTargetWeight());
        existingProfile.setActivityLevel(updatedProfile.getActivityLevel());
        existingProfile.setGoal(updatedProfile.getGoal());

        UserProfile savedProfile = profileService.saveProfile(existingProfile, user);
        return ResponseEntity.ok(savedProfile);
    }
}
