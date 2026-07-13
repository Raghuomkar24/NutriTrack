package com.nutritrack.api.service;

import com.nutritrack.api.model.User;
import com.nutritrack.api.model.UserProfile;
import com.nutritrack.api.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    @Autowired
    private UserProfileRepository profileRepository;

    @Transactional
    public UserProfile saveProfile(UserProfile profile, User user) {
        profile.setUser(user);
        calculateMetrics(profile);
        return profileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public UserProfile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId).orElse(null);
    }

    public void calculateMetrics(UserProfile profile) {
        if (profile.getHeight() == null || profile.getWeight() == null || profile.getAge() == null) {
            return;
        }

        // 1. Calculate BMI
        double heightInMeters = profile.getHeight() / 100.0;
        double bmi = profile.getWeight() / (heightInMeters * heightInMeters);
        profile.setBmi(Math.round(bmi * 100.0) / 100.0);

        // 2. Calculate BMR (Mifflin-St Jeor Equation)
        double bmr;
        if ("MALE".equalsIgnoreCase(profile.getGender())) {
            bmr = 10 * profile.getWeight() + 6.25 * profile.getHeight() - 5 * profile.getAge() + 5;
        } else {
            bmr = 10 * profile.getWeight() + 6.25 * profile.getHeight() - 5 * profile.getAge() - 161;
        }
        profile.setBmr(Math.round(bmr * 100.0) / 100.0);

        // 3. Calculate TDEE
        double activityMultiplier = 1.2; // default SEDENTARY
        if (profile.getActivityLevel() != null) {
            switch (profile.getActivityLevel().toUpperCase()) {
                case "LIGHTLY_ACTIVE":
                    activityMultiplier = 1.375;
                    break;
                case "MODERATELY_ACTIVE":
                    activityMultiplier = 1.55;
                    break;
                case "VERY_ACTIVE":
                    activityMultiplier = 1.725;
                    break;
                case "EXTRA_ACTIVE":
                    activityMultiplier = 1.9;
                    break;
            }
        }
        double tdee = bmr * activityMultiplier;
        profile.setTdee(Math.round(tdee * 100.0) / 100.0);

        // 4. Calculate Daily Calories based on Goal
        double targetCalories = tdee;
        if (profile.getGoal() != null) {
            switch (profile.getGoal().toUpperCase()) {
                case "LOSE_WEIGHT":
                    targetCalories = tdee - 500;
                    break;
                case "GAIN_MUSCLE":
                    targetCalories = tdee + 350;
                    break;
            }
        }
        profile.setDailyCalories(Math.round(targetCalories * 100.0) / 100.0);

        // 5. Calculate Macros distribution
        // Protein: 30% of calories (4 kcal/g)
        double proteinG = (targetCalories * 0.30) / 4.0;
        profile.setDailyProtein(Math.round(proteinG * 10.0) / 10.0);

        // Carbs: 45% of calories (4 kcal/g)
        double carbsG = (targetCalories * 0.45) / 4.0;
        profile.setDailyCarbs(Math.round(carbsG * 10.0) / 10.0);

        // Fat: 25% of calories (9 kcal/g)
        double fatG = (targetCalories * 0.25) / 9.0;
        profile.setDailyFat(Math.round(fatG * 10.0) / 10.0);
    }
}
