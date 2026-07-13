package com.nutritrack.api.controller;

import com.nutritrack.api.config.UserDetailsImpl;
import com.nutritrack.api.dto.MealItemRequest;
import com.nutritrack.api.dto.MealRequest;
import com.nutritrack.api.model.Food;
import com.nutritrack.api.model.Meal;
import com.nutritrack.api.model.MealItem;
import com.nutritrack.api.model.User;
import com.nutritrack.api.repository.FoodRepository;
import com.nutritrack.api.repository.MealRepository;
import com.nutritrack.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meals")
public class MealController {

    @Autowired
    private MealRepository mealRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodRepository foodRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Meal>> getMealsByDate(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = getCurrentUser();
        List<Meal> meals = mealRepository.findByUserIdAndDate(user.getId(), date);
        return ResponseEntity.ok(meals);
    }

    @PostMapping
    public ResponseEntity<Meal> logMeal(@RequestBody MealRequest mealRequest) {
        User user = getCurrentUser();
        LocalDate date = LocalDate.parse(mealRequest.getDate());
        String mealType = mealRequest.getMealType().toUpperCase();

        // Check if meal type already exists for that date to append/overwrite, or start new.
        // For standard UI workflow, we overwrite/update the meal block, or create a new one.
        Meal meal = mealRepository.findByUserIdAndDateAndMealType(user.getId(), date, mealType)
                .orElse(new Meal());

        meal.setUser(user);
        meal.setDate(date);
        meal.setMealType(mealType);

        // Clear existing items if we are rewriting
        meal.getMealItems().clear();

        double totalCalories = 0;
        double totalProtein = 0;
        double totalCarbs = 0;
        double totalFat = 0;

        List<MealItem> items = new ArrayList<>();
        for (MealItemRequest itemRequest : mealRequest.getItems()) {
            Food food = foodRepository.findById(itemRequest.getFoodId())
                    .orElseThrow(() -> new RuntimeException("Food not found with id " + itemRequest.getFoodId()));

            double factor = itemRequest.getQuantityG() / 100.0;

            MealItem item = new MealItem();
            item.setMeal(meal);
            item.setFood(food);
            item.setQuantityG(itemRequest.getQuantityG());
            item.setCalories(Math.round(food.getCalories() * factor * 10.0) / 10.0);
            item.setProtein(Math.round(food.getProtein() * factor * 10.0) / 10.0);
            item.setCarbs(Math.round(food.getCarbohydrates() * factor * 10.0) / 10.0);
            item.setFat(Math.round(food.getFat() * factor * 10.0) / 10.0);

            totalCalories += item.getCalories();
            totalProtein += item.getProtein();
            totalCarbs += item.getCarbs();
            totalFat += item.getFat();

            items.add(item);
        }

        meal.getMealItems().addAll(items);
        meal.setTotalCalories(Math.round(totalCalories * 10.0) / 10.0);
        meal.setTotalProtein(Math.round(totalProtein * 10.0) / 10.0);
        meal.setTotalCarbs(Math.round(totalCarbs * 10.0) / 10.0);
        meal.setTotalFat(Math.round(totalFat * 10.0) / 10.0);

        Meal savedMeal = mealRepository.save(meal);
        return ResponseEntity.ok(savedMeal);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMeal(@PathVariable("id") Long id) {
        Meal meal = mealRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meal not found"));
        
        // Ensure user owns it
        User user = getCurrentUser();
        if (!meal.getUser().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unauthorized to delete this log."));
        }

        mealRepository.delete(meal);
        return ResponseEntity.ok(Map.of("message", "Meal log deleted successfully."));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Meal> duplicateMeal(@PathVariable("id") Long id, @RequestParam("targetDate") String targetDate) {
        Meal existingMeal = mealRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meal log not found"));

        User user = getCurrentUser();
        LocalDate target = LocalDate.parse(targetDate);

        // Remove existing target meal to prevent duplicates
        mealRepository.findByUserIdAndDateAndMealType(user.getId(), target, existingMeal.getMealType())
                .ifPresent(mealRepository::delete);

        Meal newMeal = new Meal();
        newMeal.setUser(user);
        newMeal.setDate(target);
        newMeal.setMealType(existingMeal.getMealType());
        newMeal.setTotalCalories(existingMeal.getTotalCalories());
        newMeal.setTotalProtein(existingMeal.getTotalProtein());
        newMeal.setTotalCarbs(existingMeal.getTotalCarbs());
        newMeal.setTotalFat(existingMeal.getTotalFat());

        List<MealItem> newItems = new ArrayList<>();
        for (MealItem item : existingMeal.getMealItems()) {
            MealItem newItem = new MealItem();
            newItem.setMeal(newMeal);
            newItem.setFood(item.getFood());
            newItem.setQuantityG(item.getQuantityG());
            newItem.setCalories(item.getCalories());
            newItem.setProtein(item.getProtein());
            newItem.setCarbs(item.getCarbs());
            newItem.setFat(item.getFat());
            newItems.add(newItem);
        }

        newMeal.setMealItems(newItems);
        Meal savedMeal = mealRepository.save(newMeal);

        return ResponseEntity.ok(savedMeal);
    }
}
