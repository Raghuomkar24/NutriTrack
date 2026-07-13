package com.nutritrack.api.controller;

import com.nutritrack.api.config.UserDetailsImpl;
import com.nutritrack.api.model.*;
import com.nutritrack.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class RecipeController {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private ShoppingListRepository shoppingListRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/recipes")
    public ResponseEntity<List<Recipe>> getRecipes() {
        User user = getCurrentUser();
        // Return both user-specific and platform public recipes (null createdBy)
        List<Recipe> recipes = recipeRepository.findByCreatedByIdOrPublic(user.getId());
        return ResponseEntity.ok(recipes);
    }

    @PostMapping("/recipes")
    public ResponseEntity<Recipe> createRecipe(@RequestBody Recipe recipe) {
        User user = getCurrentUser();
        recipe.setCreatedBy(user);

        // Bind bidirectionally to save cascade
        if (recipe.getRecipeIngredients() != null) {
            for (RecipeIngredient ri : recipe.getRecipeIngredients()) {
                ri.setRecipe(recipe);
                if (ri.getIngredient() != null && ri.getIngredient().getId() == null) {
                    // Create ingredient if it doesn't exist
                    Optional<Ingredient> existing = ingredientRepository.findByName(ri.getIngredient().getName());
                    if (existing.isPresent()) {
                        ri.setIngredient(existing.get());
                    } else {
                        ri.setIngredient(ingredientRepository.save(ri.getIngredient()));
                    }
                }
                ri.getId().setRecipeId(recipe.getId());
                ri.getId().setIngredientId(ri.getIngredient().getId());
            }
        }

        Recipe savedRecipe = recipeRepository.save(recipe);
        return ResponseEntity.ok(savedRecipe);
    }

    @GetMapping("/shopping-list")
    public ResponseEntity<List<ShoppingList>> getShoppingLists() {
        User user = getCurrentUser();
        return ResponseEntity.ok(shoppingListRepository.findByUserId(user.getId()));
    }

    @PostMapping("/shopping-list")
    public ResponseEntity<ShoppingList> saveShoppingList(@RequestBody ShoppingList list) {
        User user = getCurrentUser();
        list.setUser(user);
        return ResponseEntity.ok(shoppingListRepository.save(list));
    }

    @DeleteMapping("/shopping-list/{id}")
    public ResponseEntity<?> deleteShoppingList(@PathVariable("id") Long id) {
        ShoppingList list = shoppingListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shopping list not found"));
        User user = getCurrentUser();
        if (!list.getUser().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unauthorized"));
        }
        shoppingListRepository.delete(list);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    @PostMapping("/recipes/generate-shopping-list")
    public ResponseEntity<ShoppingList> generateFromRecipes(@RequestBody List<Long> recipeIds) {
        User user = getCurrentUser();
        List<Recipe> recipes = recipeRepository.findAllById(recipeIds);

        Map<String, Double> ingredientTotals = new HashMap<>();
        for (Recipe r : recipes) {
            for (RecipeIngredient ri : r.getRecipeIngredients()) {
                String name = ri.getIngredient().getName();
                double qty = ri.getQuantityG();
                ingredientTotals.put(name, ingredientTotals.getOrDefault(name, 0.0) + qty);
            }
        }

        StringBuilder itemsBuilder = new StringBuilder();
        ingredientTotals.forEach((name, qty) -> {
            if (itemsBuilder.length() > 0) {
                itemsBuilder.append(",");
            }
            itemsBuilder.append(name).append(":").append(qty).append("g");
        });

        ShoppingList list = new ShoppingList();
        list.setUser(user);
        list.setName("Grocery list from " + recipes.size() + " recipes");
        list.setItems(itemsBuilder.toString());

        return ResponseEntity.ok(shoppingListRepository.save(list));
    }
}
