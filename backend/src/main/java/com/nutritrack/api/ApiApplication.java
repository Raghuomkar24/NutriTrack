package com.nutritrack.api;

import com.nutritrack.api.model.*;
import com.nutritrack.api.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@SpringBootApplication
public class ApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository,
                                      UserRepository userRepository,
                                      FoodCategoryRepository categoryRepository,
                                      FoodRepository foodRepository,
                                      PasswordEncoder encoder) {
        return args -> {
            // 1. Initialize Roles
            if (roleRepository.count() == 0) {
                Role userRole = new Role(null, ERole.ROLE_USER);
                Role adminRole = new Role(null, ERole.ROLE_ADMIN);
                roleRepository.saveAll(List.of(userRole, adminRole));
            }

            // 2. Initialize Seed Categories
            if (categoryRepository.count() == 0) {
                categoryRepository.saveAll(List.of(
                        new FoodCategory("Fruits & Vegetables", "Fresh whole foods direct from nature"),
                        new FoodCategory("Dairy & Eggs", "Milk, cheese, yogurt, eggs and butter"),
                        new FoodCategory("Meat & Poultry", "Beef, chicken, pork, turkey, lamb"),
                        new FoodCategory("Seafood", "Fish, shrimp, crab, salmon, tuna"),
                        new FoodCategory("Grains, Bread & Pasta", "Oats, rice, bread, pasta, quinoa"),
                        new FoodCategory("Beverages", "Water, teas, juice, soda"),
                        new FoodCategory("Snacks & Sweets", "Chips, cookies, chocolates, protein bars")
                ));
            }

            // 3. Initialize Default Users if not present
            if (userRepository.count() == 0) {
                // Default User: password123
                User user = new User("user@nutritrack.com", encoder.encode("password123"));
                Role uRole = roleRepository.findByName(ERole.ROLE_USER).orElse(null);
                if (uRole != null) {
                    user.setRoles(Set.of(uRole));
                }
                userRepository.save(user);

                // Default Admin: password123
                User admin = new User("admin@nutritrack.com", encoder.encode("password123"));
                Role aRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElse(null);
                if (aRole != null) {
                    admin.setRoles(Set.of(aRole));
                }
                userRepository.save(admin);
            }

            // 4. Initialize Core Food items if empty
            if (foodRepository.count() == 0) {
                FoodCategory fruitCat = categoryRepository.findByName("Fruits & Vegetables").orElse(null);
                FoodCategory dairyCat = categoryRepository.findByName("Dairy & Eggs").orElse(null);
                FoodCategory grainCat = categoryRepository.findByName("Grains, Bread & Pasta").orElse(null);

                if (fruitCat != null) {
                    Food apple = new Food();
                    apple.setName("Apple (with skin)");
                    apple.setCategory(fruitCat);
                    apple.setBrand("Generic");
                    apple.setCalories(52.0);
                    apple.setProtein(0.3);
                    apple.setFat(0.2);
                    apple.setCarbohydrates(14.0);
                    apple.setFiber(2.4);
                    apple.setSugar(10.0);
                    apple.setSodium(1.0);
                    apple.setServingSize("1 medium (182g)");
                    apple.setImageUrl("https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6");
                    apple.setBarcode("000000000001");
                    foodRepository.save(apple);
                }

                if (dairyCat != null) {
                    Food yogurt = new Food();
                    yogurt.setName("Greek Yogurt (Non-Fat, Plain)");
                    yogurt.setCategory(dairyCat);
                    yogurt.setBrand("Chobani");
                    yogurt.setCalories(59.0);
                    yogurt.setProtein(10.3);
                    yogurt.setFat(0.4);
                    yogurt.setCarbohydrates(3.6);
                    yogurt.setSugar(3.2);
                    yogurt.setSodium(36.0);
                    yogurt.setServingSize("1 container (150g)");
                    yogurt.setImageUrl("https://images.unsplash.com/photo-1488477181946-6428a0291777");
                    yogurt.setBarcode("045678901234");
                    foodRepository.save(yogurt);
                }

                if (grainCat != null) {
                    Food oats = new Food();
                    oats.setName("Rolled Oats");
                    oats.setCategory(grainCat);
                    oats.setBrand("Quaker Oats");
                    oats.setCalories(379.0);
                    oats.setProtein(13.2);
                    oats.setFat(6.5);
                    oats.setCarbohydrates(67.7);
                    oats.setFiber(10.1);
                    oats.setSugar(1.0);
                    oats.setSodium(2.0);
                    oats.setServingSize("1/2 cup (40g)");
                    oats.setImageUrl("https://images.unsplash.com/photo-1586444248902-2f64eddc13df");
                    oats.setBarcode("001234567890");
                    foodRepository.save(oats);
                }
            }
        };
    }
}
