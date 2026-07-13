package com.nutritrack.api.controller;

import com.nutritrack.api.config.UserDetailsImpl;
import com.nutritrack.api.dto.ChatRequest;
import com.nutritrack.api.model.User;
import com.nutritrack.api.model.UserProfile;
import com.nutritrack.api.repository.UserRepository;
import com.nutritrack.api.service.AiCoachService;
import com.nutritrack.api.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiCoachService aiCoachService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileService profileService;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/chat")
    public ResponseEntity<?> askCoach(@RequestBody ChatRequest request) {
        User user = getCurrentUser();
        UserProfile profile = profileService.getProfileByUserId(user.getId());

        String responseText = aiCoachService.getResponse(request.getMessage(), profile);
        return ResponseEntity.ok(Map.of("response", responseText));
    }

    @PostMapping("/recognize")
    public ResponseEntity<?> recognizeMealPhoto(@RequestParam("file") MultipartFile file) {
        // Image recognition simulation
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        Map<String, Object> response = new HashMap<>();

        if (filename.contains("salad")) {
            response.put("mealName", "Chicken Salad Bowl");
            response.put("estimatedCalories", 320.0);
            response.put("estimatedProtein", 28.0);
            response.put("estimatedCarbs", 12.0);
            response.put("estimatedFat", 18.0);
            response.put("confidenceScore", 0.94);
            response.put("itemsDetected", List.of("Grilled Chicken: 100g", "Mixed Lettuce: 80g", "Cherry Tomatoes: 50g", "Olive Oil Dressing: 15ml"));
        } else if (filename.contains("egg") || filename.contains("breakfast")) {
            response.put("mealName", "Scrambled Eggs & Whole Wheat Toast");
            response.put("estimatedCalories", 350.0);
            response.put("estimatedProtein", 18.0);
            response.put("estimatedCarbs", 22.0);
            response.put("estimatedFat", 20.0);
            response.put("confidenceScore", 0.91);
            response.put("itemsDetected", List.of("Scrambled Eggs: 2 large", "Whole Wheat Toast: 2 slices", "Butter: 5g"));
        } else if (filename.contains("salmon") || filename.contains("fish")) {
            response.put("mealName", "Baked Salmon with Broccoli");
            response.put("estimatedCalories", 450.0);
            response.put("estimatedProtein", 34.0);
            response.put("estimatedCarbs", 8.0);
            response.put("estimatedFat", 32.0);
            response.put("confidenceScore", 0.89);
            response.put("itemsDetected", List.of("Baked Salmon: 150g", "Steamed Broccoli: 100g", "Lemon Zest: 5g"));
        } else {
            // Default generic healthy meal prep
            response.put("mealName", "Healthy Protein Meal Prep");
            response.put("estimatedCalories", 410.0);
            response.put("estimatedProtein", 32.0);
            response.put("estimatedCarbs", 40.0);
            response.put("estimatedFat", 12.0);
            response.put("confidenceScore", 0.85);
            response.put("itemsDetected", List.of("Lean Grilled Protein: 120g", "Brown Rice: 100g", "Mixed Vegetables: 100g"));
        }

        return ResponseEntity.ok(response);
    }
}
