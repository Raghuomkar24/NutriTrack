-- NutriTrack Pro Database Schema (MySQL 8)

CREATE DATABASE IF NOT EXISTS nutritrack_db;
USE nutritrack_db;

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. User Roles Mapping
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 4. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20),
    age INT,
    gender VARCHAR(10),
    height DOUBLE, -- in cm
    weight DOUBLE, -- in kg
    target_weight DOUBLE, -- in kg
    activity_level VARCHAR(30), -- SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, EXTRA_ACTIVE
    goal VARCHAR(30), -- LOSE_WEIGHT, MAINTAIN, GAIN_MUSCLE
    bmi DOUBLE,
    bmr DOUBLE,
    tdee DOUBLE,
    daily_calories DOUBLE,
    daily_protein DOUBLE,
    daily_carbs DOUBLE,
    daily_fat DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Food Categories
CREATE TABLE IF NOT EXISTS food_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- 6. Foods
CREATE TABLE IF NOT EXISTS foods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category_id INT,
    brand VARCHAR(100),
    calories DOUBLE DEFAULT 0,
    protein DOUBLE DEFAULT 0,
    fat DOUBLE DEFAULT 0,
    carbohydrates DOUBLE DEFAULT 0,
    fiber DOUBLE DEFAULT 0,
    sugar DOUBLE DEFAULT 0,
    sodium DOUBLE DEFAULT 0, -- mg
    cholesterol DOUBLE DEFAULT 0, -- mg
    potassium DOUBLE DEFAULT 0, -- mg
    calcium DOUBLE DEFAULT 0, -- mg
    iron DOUBLE DEFAULT 0, -- mg
    vitamin_a DOUBLE DEFAULT 0, -- mcg RAE
    vitamin_b DOUBLE DEFAULT 0, -- mg
    vitamin_c DOUBLE DEFAULT 0, -- mg
    vitamin_d DOUBLE DEFAULT 0, -- mcg
    vitamin_e DOUBLE DEFAULT 0, -- mg
    serving_size VARCHAR(50) DEFAULT '100g',
    ingredients TEXT,
    barcode VARCHAR(100) UNIQUE,
    image_url VARCHAR(255),
    created_by VARCHAR(50) DEFAULT 'SYSTEM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES food_categories(id) ON DELETE SET NULL
);

-- 7. Ingredients
CREATE TABLE IF NOT EXISTS ingredients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    calories DOUBLE DEFAULT 0,
    protein DOUBLE DEFAULT 0,
    fat DOUBLE DEFAULT 0,
    carbs DOUBLE DEFAULT 0
);

-- 8. Recipes
CREATE TABLE IF NOT EXISTS recipes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    image_url VARCHAR(255),
    calories DOUBLE DEFAULT 0,
    protein DOUBLE DEFAULT 0,
    fat DOUBLE DEFAULT 0,
    carbs DOUBLE DEFAULT 0,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. Recipe Ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    quantity_g DOUBLE NOT NULL DEFAULT 0,
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

-- 10. Meals
CREATE TABLE IF NOT EXISTS meals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    meal_type VARCHAR(30) NOT NULL, -- BREAKFAST, MORNING_SNACK, LUNCH, EVENING_SNACK, DINNER
    total_calories DOUBLE DEFAULT 0,
    total_protein DOUBLE DEFAULT 0,
    total_carbs DOUBLE DEFAULT 0,
    total_fat DOUBLE DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Meal Items
CREATE TABLE IF NOT EXISTS meal_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    meal_id BIGINT NOT NULL,
    food_id BIGINT,
    quantity_g DOUBLE NOT NULL DEFAULT 100,
    calories DOUBLE DEFAULT 0,
    protein DOUBLE DEFAULT 0,
    carbs DOUBLE DEFAULT 0,
    fat DOUBLE DEFAULT 0,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE SET NULL
);

-- 12. Water Logs
CREATE TABLE IF NOT EXISTS water_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    amount_ml INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. Weight Logs
CREATE TABLE IF NOT EXISTS weight_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    weight DOUBLE NOT NULL,
    bmi DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. Exercise Logs
CREATE TABLE IF NOT EXISTS exercise_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    exercise_type VARCHAR(50) NOT NULL, -- RUNNING, WALKING, GYM, CYCLING, YOGA, SWIMMING
    duration_minutes INT NOT NULL,
    calories_burned DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL, -- MEAL_REMINDER, WATER_REMINDER, EXERCISE_REMINDER, GENERAL
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    trigger_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 16. Favorites (User favorite foods)
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    food_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, food_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
);

-- 17. Shopping Lists
CREATE TABLE IF NOT EXISTS shopping_lists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    items TEXT NOT NULL, -- Stored as comma-separated or JSON list
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 18. Reports (Saved PDF metadata)
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    report_name VARCHAR(100) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
