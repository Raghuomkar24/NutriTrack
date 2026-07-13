package com.nutritrack.api.controller;

import com.nutritrack.api.model.User;
import com.nutritrack.api.model.UserProfile;
import com.nutritrack.api.repository.FoodRepository;
import com.nutritrack.api.repository.MealRepository;
import com.nutritrack.api.repository.UserRepository;
import com.nutritrack.api.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private MealRepository mealRepository;

    @Autowired
    private ProfileService profileService;

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("email", u.getEmail());
            map.put("emailVerified", u.getEmailVerified());
            map.put("createdAt", u.getCreatedAt());
            map.put("roles", u.getRoles());

            UserProfile profile = profileService.getProfileByUserId(u.getId());
            if (profile != null) {
                map.put("name", profile.getName());
                map.put("gender", profile.getGender());
                map.put("goal", profile.getGoal());
                map.put("weight", profile.getWeight());
            } else {
                map.put("name", "-");
            }
            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalUsers = userRepository.count();
        long totalFoods = foodRepository.count();
        long totalMeals = mealRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalFoods", totalFoods);
        stats.put("totalMeals", totalMeals);
        stats.put("platformActiveScore", 98.4);

        return ResponseEntity.ok(stats);
    }
}
