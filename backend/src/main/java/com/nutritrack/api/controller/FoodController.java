package com.nutritrack.api.controller;

import com.nutritrack.api.config.UserDetailsImpl;
import com.nutritrack.api.model.Favorite;
import com.nutritrack.api.model.Food;
import com.nutritrack.api.model.FoodCategory;
import com.nutritrack.api.model.User;
import com.nutritrack.api.repository.FavoriteRepository;
import com.nutritrack.api.repository.FoodCategoryRepository;
import com.nutritrack.api.repository.FoodRepository;
import com.nutritrack.api.repository.UserRepository;
import com.nutritrack.api.service.OpenFoodFactsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/foods")
public class FoodController {

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private FoodCategoryRepository categoryRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OpenFoodFactsService openFoodFactsService;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Food>> searchFoods(@RequestParam(value = "q", required = false) String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(foodRepository.findAll());
        }
        return ResponseEntity.ok(foodRepository.findByNameContainingIgnoreCaseOrBrandContainingIgnoreCase(query, query));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<FoodCategory>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<Food> getFoodByBarcode(@PathVariable("barcode") String barcode) {
        Optional<Food> food = openFoodFactsService.lookupBarcode(barcode);
        return food.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Food> createFood(@RequestBody Food food) {
        // Associate food with user/system creators
        User user = getCurrentUser();
        food.setCreatedBy("USER_" + user.getId());
        Food savedFood = foodRepository.save(food);
        return ResponseEntity.ok(savedFood);
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<Food>> getFavorites() {
        User user = getCurrentUser();
        List<Favorite> favorites = favoriteRepository.findByUserId(user.getId());
        List<Food> favoriteFoods = favorites.stream()
                .map(Favorite::getFood)
                .collect(Collectors.toList());
        return ResponseEntity.ok(favoriteFoods);
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<?> toggleFavorite(@PathVariable("id") Long foodId) {
        User user = getCurrentUser();
        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food item not found"));

        Optional<Favorite> favoriteOpt = favoriteRepository.findByUserIdAndFoodId(user.getId(), foodId);

        if (favoriteOpt.isPresent()) {
            favoriteRepository.delete(favoriteOpt.get());
            return ResponseEntity.ok(Map.of("favorited", false, "message", "Food removed from favorites."));
        } else {
            Favorite favorite = new Favorite(user, food);
            favoriteRepository.save(favorite);
            return ResponseEntity.ok(Map.of("favorited", true, "message", "Food added to favorites."));
        }
    }
}
