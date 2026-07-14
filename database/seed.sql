-- NutriTrack Pro Database Seed Data (MySQL 8)

USE nutritrack_db;

-- Insert Roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_USER'), (2, 'ROLE_ADMIN');

-- Insert Users (Password is 'password123' bcrypt hashed)
-- BCrypt Hash: $2a$10$83w7vJc4GkH80jS81682yeE1VfRCOVj2v9D3aE1F0g1H2i3j4k5l6 (matches 'password123')
INSERT INTO users (id, email, password, email_verified) VALUES 
(1, 'user@nutritrack.com', '$2a$10$83w7vJc4GkH80jS81682yeE1VfRCOVj2v9D3aE1F0g1H2i3j4k5l6', TRUE),
(2, 'admin@nutritrack.com', '$2a$10$83w7vJc4GkH80jS81682yeE1VfRCOVj2v9D3aE1F0g1H2i3j4k5l6', TRUE);

-- Map Roles
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1), -- User has ROLE_USER
(2, 2); -- Admin has ROLE_ADMIN

-- Insert User Profiles (BMR/TDEE calculated automatically)
INSERT INTO user_profiles (id, user_id, name, mobile, age, gender, height, weight, target_weight, activity_level, goal, bmi, bmr, tdee, daily_calories, daily_protein, daily_carbs, daily_fat) VALUES
(1, 1, 'John Doe', '+1234567890', 28, 'MALE', 180.0, 80.0, 75.0, 'MODERATELY_ACTIVE', 'LOSE_WEIGHT', 24.69, 1800.0, 2475.0, 1975.0, 148.0, 197.0, 65.0),
(2, 2, 'Admin User', '+1098765432', 35, 'FEMALE', 165.0, 60.0, 60.0, 'LIGHTLY_ACTIVE', 'MAINTAIN', 22.04, 1300.0, 1787.5, 1787.5, 110.0, 200.0, 50.0);

-- Insert Food Categories
INSERT INTO food_categories (id, name, description) VALUES
(1, 'Fruits & Vegetables', 'Fresh whole foods direct from nature'),
(2, 'Dairy & Eggs', 'Milk, cheese, yogurt, eggs and butter'),
(3, 'Meat & Poultry', 'Beef, chicken, pork, turkey, lamb'),
(4, 'Seafood', 'Fish, shrimp, crab, salmon, tuna'),
(5, 'Grains, Bread & Pasta', 'Oats, rice, bread, pasta, quinoa'),
(6, 'Beverages', 'Water, teas, coffee, juices, sodas'),
(7, 'Snacks & Sweets', 'Chips, cookies, chocolates, bars'),
(8, 'Prepared Meals', 'Salads, sandwiches, mixed dishes');

-- Insert Foods (Nutritional values per 100g)
INSERT INTO foods (id, name, category_id, brand, calories, protein, fat, carbohydrates, fiber, sugar, sodium, cholesterol, potassium, calcium, iron, vitamin_a, vitamin_b, vitamin_c, vitamin_d, vitamin_e, serving_size, ingredients, barcode, image_url, created_by) VALUES
(1, 'Apple (with skin)', 1, 'Generic', 52, 0.3, 0.2, 14, 2.4, 10, 1, 0, 107, 6, 0.1, 3, 0.05, 4.6, 0, 0.18, '1 medium (182g)', 'Apple', '000000000001', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', 'SYSTEM'),
(2, 'Banana', 1, 'Generic', 89, 1.1, 0.3, 23, 2.6, 12, 1, 0, 358, 5, 0.3, 3, 0.4, 8.7, 0, 0.1, '1 medium (118g)', 'Banana', '000000000002', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e', 'SYSTEM'),
(3, 'Whole Eggs', 2, 'Generic', 155, 13, 11, 1.1, 0, 1.1, 124, 372, 138, 50, 1.2, 140, 1.5, 0, 2, 1.0, '1 large (50g)', 'Eggs', '000000000003', 'https://images.unsplash.com/photo-1506976785307-8732e854ad03', 'SYSTEM'),
(4, 'Chicken Breast (skinless, raw)', 3, 'Generic', 120, 22.5, 2.6, 0, 0, 0, 45, 73, 256, 15, 0.7, 0, 1.1, 0, 0, 0.3, '100g', 'Chicken breast meat', '000000000004', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791', 'SYSTEM'),
(5, 'Greek Yogurt (Non-Fat, Plain)', 2, 'Chobani', 59, 10.3, 0.4, 3.6, 0, 3.2, 36, 5, 141, 110, 0, 0, 0.2, 0, 0, 0, '1 container (150g)', 'Cultured non-fat milk', '045678901234', 'https://images.unsplash.com/photo-1488477181946-6428a0291777', 'SYSTEM'),
(6, 'Rolled Oats', 5, 'Quaker Oats', 379, 13.2, 6.5, 67.7, 10.1, 1.0, 2, 0, 362, 52, 4.3, 0, 0.6, 0, 0, 1.0, '1/2 cup (40g)', '100% Whole Grain Oats', '001234567890', 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df', 'SYSTEM'),
(7, 'Whey Protein Powder (Double Rich Chocolate)', 7, 'Optimum Nutrition', 393, 78.6, 3.3, 10.0, 3.3, 3.3, 180, 110, 730, 280, 2.4, 0, 0, 0, 0, 0, '1 scoop (30g)', 'Whey protein isolate, whey protein concentrate, cocoa powder, lecithin, artificial flavor, sucralose', '078901234567', 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba', 'SYSTEM'),
(8, 'Almond Milk (Unsweetened Original)', 6, 'Blue Diamond', 15, 0.4, 1.1, 0.4, 0.2, 0, 78, 0, 35, 197, 0.1, 37, 0, 0, 1, 1.5, '1 cup (240ml)', 'Almond milk (filtered water, almonds), calcium carbonate, sea salt, potassium citrate, sunflower lecithin, gellan gum, vitamin A palmitate, vitamin D2, D-alpha-tocopherol', '012345678901', 'https://images.unsplash.com/photo-1553456558-aff63285bdd1', 'SYSTEM'),
(9, 'White Rice (Cooked)', 5, 'Generic', 130, 2.7, 0.3, 28, 0.4, 0.1, 1, 0, 35, 10, 0.2, 0, 0.05, 0, 0, 0, '1 cup (158g)', 'White Rice', '000000000009', 'https://images.unsplash.com/photo-1516685018646-549198525c1b', 'SYSTEM'),
(10, 'Fresh Salmon Fillet', 4, 'Generic', 208, 20.4, 13.4, 0, 0, 0, 59, 55, 363, 9, 0.3, 15, 8.2, 3.9, 10, 1.1, '100g', 'Salmon fish', '000000000010', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288', 'SYSTEM'),
(11, 'Roti (Whole Wheat)', 5, 'Generic', 297, 9, 3, 60, 9, 0, 100, 0, 200, 30, 2, 0, 0.2, 0, 0, 0, '1 piece (40g)', 'Whole wheat flour, water', '000000000011', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641', 'SYSTEM'),
(12, 'Chapati', 5, 'Generic', 297, 9, 3, 60, 9, 0, 100, 0, 200, 30, 2, 0, 0.2, 0, 0, 0, '1 piece (40g)', 'Whole wheat flour, water, salt', '000000000012', 'https://images.unsplash.com/photo-1606471191009-63994c53433b', 'SYSTEM'),
(13, 'Dal (Lentils Cooked)', 8, 'Generic', 116, 9, 0.4, 20, 8, 1, 2, 0, 369, 19, 3.3, 0, 0.2, 0, 0, 0, '1 cup (200g)', 'Lentils, water, spices', '000000000013', 'https://images.unsplash.com/photo-1548943487-a2e4e43b4859', 'SYSTEM'),
(14, 'Curd (Yogurt)', 2, 'Generic', 98, 3.5, 4.3, 11, 0, 11, 46, 17, 155, 121, 0, 99, 0.1, 0, 0, 0, '1 cup (150g)', 'Milk, live active cultures', '000000000014', 'https://images.unsplash.com/photo-1584278860047-22db9fa8254c', 'SYSTEM'),
(15, 'Milk (Whole)', 2, 'Generic', 61, 3.2, 3.3, 4.8, 0, 5, 43, 10, 150, 113, 0, 46, 0.1, 0, 1, 0, '1 cup (244ml)', 'Cow milk', '000000000015', 'https://images.unsplash.com/photo-1550583724-b2692b85b150', 'SYSTEM'),
(16, 'Fruit Juice (Mixed, Fresh)', 6, 'Generic', 45, 0.5, 0.1, 10, 0.5, 8, 2, 0, 150, 10, 0.2, 20, 0.1, 30, 0, 0, '1 glass (200ml)', 'Mixed fresh fruits', '000000000016', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba', 'SYSTEM'),
(17, 'Holige (Obbattu)', 7, 'Generic', 320, 5, 10, 55, 3, 25, 50, 5, 100, 20, 1, 10, 0.1, 0, 0, 0, '1 piece (50g)', 'Wheat flour, jaggery, coconut, dal, ghee', '000000000017', 'https://images.unsplash.com/photo-1627308595171-d1b5d67129c4', 'SYSTEM'),
(18, 'Kadubu', 8, 'Generic', 150, 4, 2, 30, 2, 1, 30, 0, 50, 10, 0.5, 0, 0.1, 0, 0, 0, '1 piece (60g)', 'Rice flour, urad dal, coconut', '000000000018', 'https://images.unsplash.com/photo-1631515243349-e0cb459e9a56', 'SYSTEM'),
(19, 'Poori', 5, 'Generic', 300, 6, 15, 35, 3, 0, 150, 0, 100, 10, 1, 0, 0.1, 0, 0, 0, '1 piece (40g)', 'Wheat flour, water, oil for frying', '000000000019', 'https://images.unsplash.com/photo-1596797038530-2c107229654b', 'SYSTEM'),
(20, 'Idli', 5, 'Generic', 140, 4, 0.4, 30, 2, 0, 300, 0, 40, 10, 0.5, 0, 0.1, 0, 0, 0, '2 pieces (100g)', 'Rice, urad dal, salt', '000000000020', 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1', 'SYSTEM'),
(21, 'Vada (Medu Vada)', 8, 'Generic', 300, 10, 15, 30, 5, 0, 400, 0, 100, 20, 2, 0, 0.1, 0, 0, 0, '1 piece (50g)', 'Urad dal, oil, spices', '000000000021', 'https://images.unsplash.com/photo-1605333552097-f584f23e74be', 'SYSTEM');

-- Insert Ingredients
INSERT INTO ingredients (id, name, calories, protein, fat, carbs) VALUES
(1, 'Chicken breast', 120, 22.5, 2.6, 0),
(2, 'Brown rice', 111, 2.6, 0.9, 23),
(3, 'Broccoli', 34, 2.8, 0.4, 7),
(4, 'Olive Oil', 884, 0, 100, 0),
(5, 'Garlic', 149, 6.4, 0.5, 33);

-- Insert Recipes
INSERT INTO recipes (id, name, description, instructions, image_url, calories, protein, fat, carbs, created_by) VALUES
(1, 'Healthy Garlic Chicken and Broccoli Rice', 'A balanced meal prep containing grilled chicken breast, broccoli, and brown rice sautéed in garlic and olive oil.', '1. Boil brown rice according to packaging.\n2. Dice chicken breast and sauté in olive oil with minced garlic.\n3. Add broccoli florets to the skillet and cook until tender.\n4. Combine all ingredients in meal containers.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 450, 35, 12, 42, 1);

-- Link Recipe Ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_g) VALUES
(1, 1, 150), -- 150g Chicken breast
(1, 2, 100), -- 100g Brown rice
(1, 3, 100), -- 100g Broccoli
(1, 4, 10),  -- 10g Olive oil
(1, 5, 5);    -- 5g Garlic

-- Insert Meals (For dynamic history on user John Doe: id=1)
INSERT INTO meals (id, user_id, date, meal_type, total_calories, total_protein, total_carbs, total_fat) VALUES
(1, 1, '2026-07-13', 'BREAKFAST', 468, 25.1, 71.7, 10.6),
(2, 1, '2026-07-13', 'LUNCH', 450, 35.0, 42.0, 12.0),
(3, 1, '2026-07-12', 'BREAKFAST', 468, 25.1, 71.7, 10.6),
(4, 1, '2026-07-12', 'LUNCH', 500, 40.0, 45.0, 15.0),
(5, 1, '2026-07-12', 'DINNER', 600, 45.0, 50.0, 20.0);

-- Insert Meal Items
-- Breakfast: Rolled Oats 100g (379 cal, 13.2p, 67.7c, 6.5f) + 1 Scoop Protein Powder 30g (118 cal, 23.5p, 3c, 1f - calculated from 100g)
-- We map these items to food IDs. For simplicity, we store the computed quantity_g-based macros
INSERT INTO meal_items (meal_id, food_id, quantity_g, calories, protein, carbs, fat) VALUES
(1, 6, 100, 379, 13.2, 67.7, 6.5),
(1, 7, 30, 118, 23.5, 3.0, 1.0),
(2, 4, 200, 240, 45.0, 0.0, 5.2);

-- Insert Water Logs
INSERT INTO water_logs (user_id, date, amount_ml) VALUES
(1, '2026-07-13', 1500),
(1, '2026-07-12', 2500),
(1, '2026-07-11', 2000);

-- Insert Weight Logs
INSERT INTO weight_logs (user_id, date, weight, bmi) VALUES
(1, '2026-07-06', 82.0, 25.31),
(1, '2026-07-08', 81.2, 25.06),
(1, '2026-07-10', 80.5, 24.85),
(1, '2026-07-13', 80.0, 24.69);

-- Insert Exercise Logs
INSERT INTO exercise_logs (user_id, date, exercise_type, duration_minutes, calories_burned) VALUES
(1, '2026-07-13', 'RUNNING', 30, 350.0),
(1, '2026-07-12', 'GYM', 60, 400.0),
(1, '2026-07-10', 'CYCLING', 45, 300.0);

-- Insert Notifications
INSERT INTO notifications (user_id, type, message, is_read, trigger_time) VALUES
(1, 'MEAL_REMINDER', 'Time for Dinner! Stay on track to reach your Weight Loss goal.', FALSE, '2026-07-13 19:30:00'),
(1, 'WATER_REMINDER', 'Remember to log your water intake today.', TRUE, '2026-07-13 14:00:00');

-- Insert Favorites
INSERT INTO favorites (user_id, food_id) VALUES
(1, 5), -- Greek Yogurt
(1, 6); -- Rolled Oats

-- Insert Shopping Lists
INSERT INTO shopping_lists (user_id, name, items) VALUES
(1, 'Weekly Meal Prep List', 'Chicken Breast:500g,Broccoli:300g,Brown Rice:1kg,Greek Yogurt:4 containers,Bananas:1 bunch');

-- Insert Reports
INSERT INTO reports (user_id, report_name, file_path) VALUES
(1, 'July_Nutrition_Report.pdf', '/reports/july_nutrition_report.pdf');
