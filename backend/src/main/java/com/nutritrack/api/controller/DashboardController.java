package com.nutritrack.api.controller;

import com.nutritrack.api.config.UserDetailsImpl;
import com.nutritrack.api.dto.DashboardSummary;
import com.nutritrack.api.model.*;
import com.nutritrack.api.repository.*;
import com.nutritrack.api.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private MealRepository mealRepository;

    @Autowired
    private WaterLogRepository waterLogRepository;

    @Autowired
    private ExerciseLogRepository exerciseLogRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getSummary(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = getCurrentUser();
        UserProfile profile = profileService.getProfileByUserId(user.getId());

        DashboardSummary summary = new DashboardSummary();

        // 1. Set goals from profile
        if (profile != null) {
            summary.setDailyCaloriesGoal(profile.getDailyCalories());
            summary.setDailyProteinGoal(profile.getDailyProtein());
            summary.setDailyCarbsGoal(profile.getDailyCarbs());
            summary.setDailyFatGoal(profile.getDailyFat());
        }

        // 2. Aggregate meals consumed
        List<Meal> meals = mealRepository.findByUserIdAndDate(user.getId(), date);
        summary.setTodayMeals(meals);

        double calories = 0;
        double protein = 0;
        double carbs = 0;
        double fat = 0;

        for (Meal meal : meals) {
            calories += meal.getTotalCalories();
            protein += meal.getTotalProtein();
            carbs += meal.getTotalCarbs();
            fat += meal.getTotalFat();
        }

        summary.setCaloriesConsumed(Math.round(calories * 10.0) / 10.0);
        summary.setProteinConsumed(Math.round(protein * 10.0) / 10.0);
        summary.setCarbsConsumed(Math.round(carbs * 10.0) / 10.0);
        summary.setFatConsumed(Math.round(fat * 10.0) / 10.0);

        // 3. Aggregate water intake
        int water = waterLogRepository.findByUserIdAndDate(user.getId(), date)
                .map(WaterLog::getAmountMl)
                .orElse(0);
        summary.setWaterConsumedMl(water);

        // 4. Aggregate exercise calories burned
        List<ExerciseLog> exercises = exerciseLogRepository.findByUserIdAndDate(user.getId(), date);
        double burned = exercises.stream()
                .mapToDouble(ExerciseLog::getCaloriesBurned)
                .sum();
        summary.setCaloriesBurned(Math.round(burned * 10.0) / 10.0);

        // 5. Streak count
        summary.setStreakCount(5); // Seed static for presentation

        return ResponseEntity.ok(summary);
    }
}
