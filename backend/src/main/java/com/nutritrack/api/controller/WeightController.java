package com.nutritrack.api.controller;

import com.nutritrack.api.config.UserDetailsImpl;
import com.nutritrack.api.model.User;
import com.nutritrack.api.model.UserProfile;
import com.nutritrack.api.model.WeightLog;
import com.nutritrack.api.repository.UserRepository;
import com.nutritrack.api.repository.WeightLogRepository;
import com.nutritrack.api.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weight")
public class WeightController {

    @Autowired
    private WeightLogRepository weightLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileService profileService;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<WeightLog>> getWeightHistory() {
        User user = getCurrentUser();
        List<WeightLog> history = weightLogRepository.findByUserIdOrderByDateAsc(user.getId());
        return ResponseEntity.ok(history);
    }

    @PostMapping
    public ResponseEntity<WeightLog> logWeight(@RequestBody Map<String, Object> body) {
        User user = getCurrentUser();
        LocalDate date = LocalDate.parse(body.get("date").toString());
        Double weight = Double.parseDouble(body.get("weight").toString());

        UserProfile profile = profileService.getProfileByUserId(user.getId());
        double bmi = 22.0; // default fallback

        if (profile != null) {
            // Update profile weight and recalculate
            profile.setWeight(weight);
            profileService.saveProfile(profile, user);
            bmi = profile.getBmi();
        }

        WeightLog log = weightLogRepository.findByUserIdAndDate(user.getId(), date)
                .orElse(new WeightLog());

        log.setUser(user);
        log.setDate(date);
        log.setWeight(weight);
        log.setBmi(bmi);

        WeightLog savedLog = weightLogRepository.save(log);
        return ResponseEntity.ok(savedLog);
    }
}
