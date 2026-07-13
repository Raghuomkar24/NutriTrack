package com.nutritrack.api.dto;

import com.nutritrack.api.model.Meal;
import lombok.Data;

import java.util.List;

@Data
public class DashboardSummary {
    private Double dailyCaloriesGoal = 2000.0;
    private Double dailyProteinGoal = 150.0;
    private Double dailyCarbsGoal = 225.0;
    private Double dailyFatGoal = 65.0;

    private Double caloriesConsumed = 0.0;
    private Double proteinConsumed = 0.0;
    private Double carbsConsumed = 0.0;
    private Double fatConsumed = 0.0;

    private Double caloriesBurned = 0.0;
    private Integer waterConsumedMl = 0;
    private Integer waterGoal = 2500;

    private Integer streakCount = 3; // Seed static for presentation
    private List<Meal> todayMeals;
}
