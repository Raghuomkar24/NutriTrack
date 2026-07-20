/**
 * Indian Food Database — 130+ items
 * Exported as INDIAN_FOODS for use by seed.js
 * Also runnable standalone: node src/config/seedIndianFoods.js
 *
 * All values per 100g (cooked unless noted), sourced from ICMR-NIN.
 * Calories = kcal/100g, Protein / Carbs / Fat = g/100g
 */

// ─── Standalone runner setup ──────────────────────────────────────────────────
const isStandalone = require.main === module;
if (isStandalone) {
  require('dotenv').config();
}

// ─── Indian Food Data ─────────────────────────────────────────────────────────
const INDIAN_FOODS = [

  // ── BREAKFAST ──────────────────────────────────────────────────────────────
  { name: 'Idli',                    category: 'Breakfast', brand: 'Indian', calories: 58,  protein: 2.0, carbohydrates: 12.1, fat: 0.3,  servingSize: '1 piece (40g)' },
  { name: 'Dosa (Plain)',            category: 'Breakfast', brand: 'Indian', calories: 168, protein: 3.9, carbohydrates: 29.1, fat: 3.7,  servingSize: '1 piece (80g)' },
  { name: 'Masala Dosa',             category: 'Breakfast', brand: 'Indian', calories: 220, protein: 4.5, carbohydrates: 32.0, fat: 7.5,  servingSize: '1 piece (120g)' },
  { name: 'Uttapam',                 category: 'Breakfast', brand: 'Indian', calories: 130, protein: 3.5, carbohydrates: 24.0, fat: 2.8,  servingSize: '1 piece (80g)' },
  { name: 'Medu Vada',               category: 'Breakfast', brand: 'Indian', calories: 300, protein: 10.0, carbohydrates: 30.0, fat: 15.0, servingSize: '1 piece (50g)' },
  { name: 'Upma',                    category: 'Breakfast', brand: 'Indian', calories: 172, protein: 4.4, carbohydrates: 29.8, fat: 4.3,  servingSize: '1 cup (180g)' },
  { name: 'Poha (Flattened Rice)',   category: 'Breakfast', brand: 'Indian', calories: 198, protein: 3.5, carbohydrates: 42.0, fat: 2.0,  servingSize: '1 cup (100g)' },
  { name: 'Aloo Paratha',            category: 'Breakfast', brand: 'Indian', calories: 257, protein: 5.5, carbohydrates: 36.0, fat: 10.5, servingSize: '1 piece (100g)' },
  { name: 'Gobi Paratha',            category: 'Breakfast', brand: 'Indian', calories: 240, protein: 5.0, carbohydrates: 34.0, fat: 9.5,  servingSize: '1 piece (100g)' },
  { name: 'Paneer Paratha',          category: 'Breakfast', brand: 'Indian', calories: 290, protein: 9.5, carbohydrates: 34.0, fat: 12.0, servingSize: '1 piece (110g)' },
  { name: 'Moong Dal Chilla',        category: 'Breakfast', brand: 'Indian', calories: 170, protein: 9.0, carbohydrates: 25.0, fat: 3.5,  servingSize: '1 piece (80g)' },
  { name: 'Besan Chilla',            category: 'Breakfast', brand: 'Indian', calories: 180, protein: 8.5, carbohydrates: 26.0, fat: 4.0,  servingSize: '1 piece (80g)' },
  { name: 'Poori',                   category: 'Breakfast', brand: 'Indian', calories: 300, protein: 6.0, carbohydrates: 35.0, fat: 15.0, servingSize: '1 piece (40g)' },
  { name: 'Puri with Aloo Bhaji',    category: 'Breakfast', brand: 'Indian', calories: 380, protein: 7.5, carbohydrates: 50.0, fat: 16.0, servingSize: '2 puris + sabzi (200g)' },
  { name: 'Sabudana Khichdi',        category: 'Breakfast', brand: 'Indian', calories: 250, protein: 3.5, carbohydrates: 50.0, fat: 5.0,  servingSize: '1 cup (150g)' },
  { name: 'Pesarattu (Green Gram Dosa)', category: 'Breakfast', brand: 'Indian', calories: 125, protein: 6.5, carbohydrates: 20.0, fat: 2.0, servingSize: '1 piece (80g)' },
  { name: 'Rava Dosa',               category: 'Breakfast', brand: 'Indian', calories: 178, protein: 4.2, carbohydrates: 27.0, fat: 5.8,  servingSize: '1 piece (90g)' },
  { name: 'Rava Idli',               category: 'Breakfast', brand: 'Indian', calories: 88,  protein: 2.8, carbohydrates: 15.0, fat: 1.8,  servingSize: '1 piece (50g)' },
  { name: 'Pongal (Khichdi)',        category: 'Breakfast', brand: 'Indian', calories: 160, protein: 4.5, carbohydrates: 28.0, fat: 3.5,  servingSize: '1 cup (180g)' },
  { name: 'Thepla',                  category: 'Breakfast', brand: 'Indian', calories: 195, protein: 5.5, carbohydrates: 30.0, fat: 6.0,  servingSize: '1 piece (60g)' },
  { name: 'Missi Roti',              category: 'Breakfast', brand: 'Indian', calories: 200, protein: 8.0, carbohydrates: 32.0, fat: 4.5,  servingSize: '1 piece (60g)' },
  { name: 'Bread Upma',              category: 'Breakfast', brand: 'Indian', calories: 188, protein: 5.0, carbohydrates: 28.0, fat: 6.0,  servingSize: '1 cup (150g)' },
  { name: 'Vermicelli Upma (Semiya)',category: 'Breakfast', brand: 'Indian', calories: 165, protein: 4.0, carbohydrates: 30.0, fat: 3.5,  servingSize: '1 cup (150g)' },
  { name: 'Kanda Poha',              category: 'Breakfast', brand: 'Indian', calories: 210, protein: 4.0, carbohydrates: 38.0, fat: 4.5,  servingSize: '1 cup (180g)' },
  { name: 'Akki Roti',               category: 'Breakfast', brand: 'Indian', calories: 200, protein: 3.5, carbohydrates: 40.0, fat: 3.0,  servingSize: '1 piece (70g)' },
  { name: 'Oats Upma',               category: 'Breakfast', brand: 'Indian', calories: 155, protein: 5.5, carbohydrates: 25.0, fat: 3.5,  servingSize: '1 cup (180g)' },
  { name: 'Daliya (Broken Wheat Porridge)', category: 'Breakfast', brand: 'Indian', calories: 145, protein: 5.0, carbohydrates: 28.0, fat: 1.5, servingSize: '1 cup (200g)' },

  // ── LUNCH & DINNER – Roti / Bread ─────────────────────────────────────────
  { name: 'Chapati / Roti (Whole Wheat)', category: 'Bread', brand: 'Indian', calories: 120, protein: 3.5, carbohydrates: 22.0, fat: 2.0,  servingSize: '1 piece (40g)' },
  { name: 'Tandoori Roti',           category: 'Bread', brand: 'Indian', calories: 125, protein: 4.0, carbohydrates: 24.0, fat: 1.5,  servingSize: '1 piece (45g)' },
  { name: 'Naan (Plain)',            category: 'Bread', brand: 'Indian', calories: 262, protein: 8.7, carbohydrates: 48.0, fat: 4.6,  servingSize: '1 piece (90g)' },
  { name: 'Butter Naan',             category: 'Bread', brand: 'Indian', calories: 310, protein: 8.5, carbohydrates: 48.0, fat: 9.5,  servingSize: '1 piece (90g)' },
  { name: 'Pita Bread (Khubz)',      category: 'Bread', brand: 'Indian', calories: 275, protein: 9.1, carbohydrates: 55.0, fat: 1.2,  servingSize: '1 piece (60g)' },
  { name: 'Makki di Roti',           category: 'Bread', brand: 'Indian', calories: 190, protein: 4.0, carbohydrates: 38.5, fat: 2.5,  servingSize: '1 piece (60g)' },
  { name: 'Bhatura',                 category: 'Bread', brand: 'Indian', calories: 320, protein: 7.0, carbohydrates: 44.0, fat: 13.0, servingSize: '1 piece (80g)' },

  // ── LUNCH & DINNER – Rice Dishes ──────────────────────────────────────────
  { name: 'White Rice (Cooked)',     category: 'Rice', brand: 'Indian', calories: 130, protein: 2.7, carbohydrates: 28.2, fat: 0.3,  servingSize: '1 cup (158g)' },
  { name: 'Brown Rice (Cooked)',     category: 'Rice', brand: 'Indian', calories: 123, protein: 2.6, carbohydrates: 25.6, fat: 0.9,  servingSize: '1 cup (195g)' },
  { name: 'Jeera Rice',              category: 'Rice', brand: 'Indian', calories: 165, protein: 3.0, carbohydrates: 32.0, fat: 3.5,  servingSize: '1 cup (160g)' },
  { name: 'Pulao (Veg)',             category: 'Rice', brand: 'Indian', calories: 175, protein: 4.0, carbohydrates: 33.0, fat: 3.5,  servingSize: '1 cup (180g)' },
  { name: 'Biryani (Chicken)',       category: 'Rice', brand: 'Indian', calories: 270, protein: 14.0, carbohydrates: 30.0, fat: 10.0, servingSize: '1 cup (250g)' },
  { name: 'Biryani (Mutton)',        category: 'Rice', brand: 'Indian', calories: 320, protein: 18.0, carbohydrates: 28.0, fat: 14.0, servingSize: '1 cup (250g)' },
  { name: 'Biryani (Vegetable)',     category: 'Rice', brand: 'Indian', calories: 210, protein: 5.0, carbohydrates: 36.0, fat: 6.0,  servingSize: '1 cup (250g)' },
  { name: 'Khichdi (Moong Dal)',     category: 'Rice', brand: 'Indian', calories: 140, protein: 6.5, carbohydrates: 24.0, fat: 2.0,  servingSize: '1 cup (200g)' },
  { name: 'Curd Rice (Thayir Sadam)', category: 'Rice', brand: 'Indian', calories: 135, protein: 4.5, carbohydrates: 22.0, fat: 3.0, servingSize: '1 cup (200g)' },
  { name: 'Lemon Rice',              category: 'Rice', brand: 'Indian', calories: 155, protein: 3.0, carbohydrates: 30.0, fat: 3.5,  servingSize: '1 cup (160g)' },
  { name: 'Tamarind Rice (Puliyodarai)', category: 'Rice', brand: 'Indian', calories: 165, protein: 3.0, carbohydrates: 31.0, fat: 4.0, servingSize: '1 cup (160g)' },
  { name: 'Coconut Rice',            category: 'Rice', brand: 'Indian', calories: 195, protein: 3.0, carbohydrates: 30.0, fat: 7.0,  servingSize: '1 cup (160g)' },
  { name: 'Sambar Rice',             category: 'Rice', brand: 'Indian', calories: 148, protein: 5.5, carbohydrates: 26.0, fat: 2.5,  servingSize: '1 cup (200g)' },

  // ── DAL / LENTILS ──────────────────────────────────────────────────────────
  { name: 'Dal Tadka (Toor Dal)',    category: 'Dal', brand: 'Indian', calories: 116, protein: 7.5, carbohydrates: 18.0, fat: 2.5,  servingSize: '1 cup (200g)' },
  { name: 'Dal Makhani',             category: 'Dal', brand: 'Indian', calories: 182, protein: 8.0, carbohydrates: 20.0, fat: 8.0,  servingSize: '1 cup (200g)' },
  { name: 'Chana Dal',               category: 'Dal', brand: 'Indian', calories: 160, protein: 10.5, carbohydrates: 25.0, fat: 2.5, servingSize: '1 cup (200g)' },
  { name: 'Moong Dal (Yellow)',      category: 'Dal', brand: 'Indian', calories: 105, protein: 7.0, carbohydrates: 17.0, fat: 0.4,  servingSize: '1 cup (200g)' },
  { name: 'Masoor Dal (Red Lentil)', category: 'Dal', brand: 'Indian', calories: 110, protein: 8.0, carbohydrates: 18.0, fat: 0.4,  servingSize: '1 cup (200g)' },
  { name: 'Rajma (Kidney Beans Curry)', category: 'Dal', brand: 'Indian', calories: 150, protein: 9.0, carbohydrates: 22.0, fat: 3.0, servingSize: '1 cup (200g)' },
  { name: 'Chole (Chickpea Curry)',  category: 'Dal', brand: 'Indian', calories: 180, protein: 9.5, carbohydrates: 27.0, fat: 5.0,  servingSize: '1 cup (200g)' },
  { name: 'Pav Bhaji',               category: 'Snack', brand: 'Indian', calories: 380, protein: 8.0, carbohydrates: 52.0, fat: 16.0, servingSize: '1 serving (200g)' },
  { name: 'Sambar',                  category: 'Dal', brand: 'Indian', calories: 60,  protein: 3.5, carbohydrates: 9.0, fat: 1.5,   servingSize: '1 cup (200g)' },

  // ── VEG SABZI / CURRIES ────────────────────────────────────────────────────
  { name: 'Aloo Gobi',               category: 'Sabzi', brand: 'Indian', calories: 120, protein: 3.0, carbohydrates: 18.0, fat: 4.5,  servingSize: '1 cup (200g)' },
  { name: 'Aloo Matar',              category: 'Sabzi', brand: 'Indian', calories: 135, protein: 4.0, carbohydrates: 20.0, fat: 4.5,  servingSize: '1 cup (200g)' },
  { name: 'Palak Paneer',            category: 'Sabzi', brand: 'Indian', calories: 200, protein: 10.0, carbohydrates: 8.0, fat: 15.0, servingSize: '1 cup (200g)' },
  { name: 'Paneer Butter Masala',    category: 'Sabzi', brand: 'Indian', calories: 300, protein: 12.0, carbohydrates: 10.0, fat: 24.0, servingSize: '1 cup (200g)' },
  { name: 'Shahi Paneer',            category: 'Sabzi', brand: 'Indian', calories: 320, protein: 12.5, carbohydrates: 10.0, fat: 26.0, servingSize: '1 cup (200g)' },
  { name: 'Matar Paneer',            category: 'Sabzi', brand: 'Indian', calories: 230, protein: 11.0, carbohydrates: 12.0, fat: 16.0, servingSize: '1 cup (200g)' },
  { name: 'Bhindi Masala (Okra)',    category: 'Sabzi', brand: 'Indian', calories: 95,  protein: 2.5, carbohydrates: 10.0, fat: 5.5,  servingSize: '1 cup (150g)' },
  { name: 'Baingan Bharta',          category: 'Sabzi', brand: 'Indian', calories: 80,  protein: 2.0, carbohydrates: 8.0, fat: 4.5,   servingSize: '1 cup (200g)' },
  { name: 'Kadai Paneer',            category: 'Sabzi', brand: 'Indian', calories: 270, protein: 11.5, carbohydrates: 9.0, fat: 21.0, servingSize: '1 cup (200g)' },
  { name: 'Lauki (Bottle Gourd) Sabzi', category: 'Sabzi', brand: 'Indian', calories: 65, protein: 2.0, carbohydrates: 9.0, fat: 2.5,  servingSize: '1 cup (200g)' },
  { name: 'Mix Veg Curry',           category: 'Sabzi', brand: 'Indian', calories: 110, protein: 3.5, carbohydrates: 14.0, fat: 5.0,  servingSize: '1 cup (200g)' },
  { name: 'Saag (Sarson Ka Saag)',   category: 'Sabzi', brand: 'Indian', calories: 90,  protein: 4.0, carbohydrates: 8.0, fat: 4.0,   servingSize: '1 cup (200g)' },
  { name: 'Methi Aloo',              category: 'Sabzi', brand: 'Indian', calories: 105, protein: 3.0, carbohydrates: 16.0, fat: 3.5,  servingSize: '1 cup (200g)' },
  { name: 'Dal Baati',               category: 'Main Course', brand: 'Indian', calories: 480, protein: 12.0, carbohydrates: 58.0, fat: 22.0, servingSize: '1 serving (250g)' },
  { name: 'Kadhi Pakora',            category: 'Main Course', brand: 'Indian', calories: 165, protein: 5.5, carbohydrates: 15.0, fat: 9.0, servingSize: '1 cup (200g)' },
  { name: 'Kadhi (Plain)',           category: 'Main Course', brand: 'Indian', calories: 95,  protein: 4.0, carbohydrates: 10.0, fat: 4.5, servingSize: '1 cup (200g)' },

  // ── NON-VEG ───────────────────────────────────────────────────────────────
  { name: 'Chicken Curry',           category: 'Non-Veg', brand: 'Indian', calories: 215, protein: 22.0, carbohydrates: 6.0,  fat: 12.0, servingSize: '1 cup (200g)' },
  { name: 'Butter Chicken (Murgh Makhani)', category: 'Non-Veg', brand: 'Indian', calories: 240, protein: 20.0, carbohydrates: 8.0, fat: 14.0, servingSize: '1 cup (200g)' },
  { name: 'Chicken Tikka Masala',    category: 'Non-Veg', brand: 'Indian', calories: 220, protein: 21.0, carbohydrates: 7.0, fat: 13.0, servingSize: '1 cup (200g)' },
  { name: 'Mutton Curry',            category: 'Non-Veg', brand: 'Indian', calories: 260, protein: 22.0, carbohydrates: 5.0, fat: 17.0, servingSize: '1 cup (200g)' },
  { name: 'Fish Curry (Salmon)',     category: 'Non-Veg', brand: 'Indian', calories: 195, protein: 20.0, carbohydrates: 5.0, fat: 11.0, servingSize: '1 cup (200g)' },
  { name: 'Egg Curry',               category: 'Non-Veg', brand: 'Indian', calories: 180, protein: 13.0, carbohydrates: 6.0, fat: 12.0, servingSize: '1 cup (200g)' },
  { name: 'Scrambled Eggs (Anda Bhurji)', category: 'Non-Veg', brand: 'Indian', calories: 175, protein: 12.0, carbohydrates: 2.0, fat: 13.0, servingSize: '1 cup (100g)' },
  { name: 'Boiled Egg',              category: 'Non-Veg', brand: 'Indian', calories: 155, protein: 13.0, carbohydrates: 1.1, fat: 11.0, servingSize: '1 large (50g)' },
  { name: 'Tandoori Chicken',        category: 'Non-Veg', brand: 'Indian', calories: 175, protein: 25.0, carbohydrates: 4.0, fat: 6.5,  servingSize: '1 piece (120g)' },
  { name: 'Chicken Tikka',           category: 'Non-Veg', brand: 'Indian', calories: 190, protein: 26.0, carbohydrates: 3.0, fat: 8.0,  servingSize: '1 piece (100g)' },
  { name: 'Keema (Minced Mutton)',   category: 'Non-Veg', brand: 'Indian', calories: 275, protein: 22.0, carbohydrates: 5.0, fat: 19.0, servingSize: '1 cup (150g)' },
  { name: 'Prawn Masala',            category: 'Non-Veg', brand: 'Indian', calories: 160, protein: 20.0, carbohydrates: 5.0, fat: 7.0,  servingSize: '1 cup (200g)' },

  // ── SNACKS ────────────────────────────────────────────────────────────────
  { name: 'Samosa (Veg)',            category: 'Snack', brand: 'Indian', calories: 260, protein: 4.5, carbohydrates: 30.0, fat: 14.0, servingSize: '1 piece (60g)' },
  { name: 'Kachori',                 category: 'Snack', brand: 'Indian', calories: 310, protein: 6.0, carbohydrates: 32.0, fat: 18.0, servingSize: '1 piece (70g)' },
  { name: 'Dhokla',                  category: 'Snack', brand: 'Indian', calories: 160, protein: 6.0, carbohydrates: 28.0, fat: 3.0,  servingSize: '4 pieces (100g)' },
  { name: 'Khakhra',                 category: 'Snack', brand: 'Indian', calories: 430, protein: 11.0, carbohydrates: 65.0, fat: 14.0, servingSize: '2 pieces (40g)' },
  { name: 'Chakli (Murukku)',        category: 'Snack', brand: 'Indian', calories: 480, protein: 8.0, carbohydrates: 58.0, fat: 24.0, servingSize: '10 pieces (50g)' },
  { name: 'Bhujia / Sev',           category: 'Snack', brand: 'Indian', calories: 540, protein: 12.0, carbohydrates: 58.0, fat: 28.0, servingSize: '1 cup (50g)' },
  { name: 'Chivda (Poha Mix)',       category: 'Snack', brand: 'Indian', calories: 400, protein: 9.0, carbohydrates: 55.0, fat: 17.0, servingSize: '1 cup (60g)' },
  { name: 'Pani Puri (Gol Gappa)',   category: 'Snack', brand: 'Indian', calories: 175, protein: 3.5, carbohydrates: 28.0, fat: 5.5,  servingSize: '6 pieces (120g)' },
  { name: 'Dahi Puri',               category: 'Snack', brand: 'Indian', calories: 210, protein: 5.0, carbohydrates: 33.0, fat: 6.5,  servingSize: '6 pieces (150g)' },
  { name: 'Pav Bhaji',               category: 'Snack', brand: 'Indian', calories: 380, protein: 8.0, carbohydrates: 52.0, fat: 16.0, servingSize: '1 serving pav + bhaji (250g)' },
  { name: 'Vada Pav',                category: 'Snack', brand: 'Indian', calories: 295, protein: 7.0, carbohydrates: 40.0, fat: 12.0, servingSize: '1 piece (130g)' },
  { name: 'Bhel Puri',               category: 'Snack', brand: 'Indian', calories: 180, protein: 4.5, carbohydrates: 32.0, fat: 4.5,  servingSize: '1 cup (120g)' },
  { name: 'Aloo Tikki',              category: 'Snack', brand: 'Indian', calories: 200, protein: 4.5, carbohydrates: 28.0, fat: 8.0,  servingSize: '2 pieces (100g)' },
  { name: 'Pakora (Onion / Pyaz)',   category: 'Snack', brand: 'Indian', calories: 280, protein: 6.0, carbohydrates: 30.0, fat: 15.0, servingSize: '1 cup (100g)' },
  { name: 'Pakora (Paneer)',         category: 'Snack', brand: 'Indian', calories: 320, protein: 12.0, carbohydrates: 20.0, fat: 22.0, servingSize: '1 cup (100g)' },
  { name: 'Namak Para',              category: 'Snack', brand: 'Indian', calories: 450, protein: 8.0, carbohydrates: 55.0, fat: 22.0, servingSize: '1 cup (50g)' },

  // ── SWEETS & DESSERTS ─────────────────────────────────────────────────────
  { name: 'Gulab Jamun',             category: 'Sweets', brand: 'Indian', calories: 370, protein: 4.5, carbohydrates: 55.0, fat: 14.0, servingSize: '2 pieces (80g)' },
  { name: 'Rasgulla',                category: 'Sweets', brand: 'Indian', calories: 186, protein: 4.5, carbohydrates: 40.0, fat: 1.5,  servingSize: '2 pieces (120g)' },
  { name: 'Kheer (Rice Pudding)',    category: 'Sweets', brand: 'Indian', calories: 190, protein: 5.5, carbohydrates: 32.0, fat: 5.5,  servingSize: '1 cup (200g)' },
  { name: 'Halwa (Sooji / Rava)',    category: 'Sweets', brand: 'Indian', calories: 350, protein: 5.0, carbohydrates: 55.0, fat: 12.0, servingSize: '1 cup (100g)' },
  { name: 'Gajar ka Halwa',          category: 'Sweets', brand: 'Indian', calories: 280, protein: 5.0, carbohydrates: 40.0, fat: 11.0, servingSize: '1 cup (150g)' },
  { name: 'Ladoo (Besan)',           category: 'Sweets', brand: 'Indian', calories: 420, protein: 7.5, carbohydrates: 55.0, fat: 18.0, servingSize: '1 piece (50g)' },
  { name: 'Barfi (Milk Barfi)',      category: 'Sweets', brand: 'Indian', calories: 400, protein: 8.0, carbohydrates: 58.0, fat: 15.0, servingSize: '1 piece (50g)' },
  { name: 'Jalebi',                  category: 'Sweets', brand: 'Indian', calories: 400, protein: 3.5, carbohydrates: 68.0, fat: 13.0, servingSize: '2 pieces (60g)' },
  { name: 'Payasam / Kheer (Vermicelli)', category: 'Sweets', brand: 'Indian', calories: 175, protein: 4.5, carbohydrates: 28.0, fat: 5.0, servingSize: '1 cup (150g)' },
  { name: 'Shrikhand',               category: 'Sweets', brand: 'Indian', calories: 265, protein: 6.0, carbohydrates: 40.0, fat: 9.0,  servingSize: '1 cup (100g)' },
  { name: 'Rasmalai',                category: 'Sweets', brand: 'Indian', calories: 220, protein: 8.0, carbohydrates: 32.0, fat: 7.5,  servingSize: '2 pieces (100g)' },

  // ── BEVERAGES ─────────────────────────────────────────────────────────────
  { name: 'Chai (Milk Tea with Sugar)', category: 'Beverage', brand: 'Indian', calories: 55, protein: 1.8, carbohydrates: 8.5, fat: 1.5, servingSize: '1 cup (150ml)' },
  { name: 'Masala Chai',             category: 'Beverage', brand: 'Indian', calories: 65,  protein: 1.8, carbohydrates: 10.0, fat: 2.0, servingSize: '1 cup (150ml)' },
  { name: 'Lassi (Sweet)',           category: 'Beverage', brand: 'Indian', calories: 150, protein: 5.5, carbohydrates: 22.0, fat: 4.5, servingSize: '1 glass (250ml)' },
  { name: 'Lassi (Salted)',          category: 'Beverage', brand: 'Indian', calories: 80,  protein: 4.5, carbohydrates: 8.0,  fat: 3.0, servingSize: '1 glass (250ml)' },
  { name: 'Mango Lassi',             category: 'Beverage', brand: 'Indian', calories: 180, protein: 4.5, carbohydrates: 30.0, fat: 4.0, servingSize: '1 glass (250ml)' },
  { name: 'Buttermilk (Chaas)',      category: 'Beverage', brand: 'Indian', calories: 40,  protein: 2.5, carbohydrates: 5.0,  fat: 1.0, servingSize: '1 glass (250ml)' },
  { name: 'Coconut Water',           category: 'Beverage', brand: 'Indian', calories: 19,  protein: 0.7, carbohydrates: 3.7,  fat: 0.2, servingSize: '1 glass (240ml)' },
  { name: 'Fresh Lime Soda',         category: 'Beverage', brand: 'Indian', calories: 30,  protein: 0.2, carbohydrates: 7.5,  fat: 0.0, servingSize: '1 glass (250ml)' },
  { name: 'Aam Panna (Raw Mango)',   category: 'Beverage', brand: 'Indian', calories: 55,  protein: 0.5, carbohydrates: 13.0, fat: 0.1, servingSize: '1 glass (200ml)' },
  { name: 'Thandai',                 category: 'Beverage', brand: 'Indian', calories: 195, protein: 5.5, carbohydrates: 26.0, fat: 8.0,  servingSize: '1 glass (250ml)' },
  { name: 'Rose Milk',               category: 'Beverage', brand: 'Indian', calories: 130, protein: 3.5, carbohydrates: 22.0, fat: 3.0,  servingSize: '1 glass (250ml)' },
  { name: 'Filter Coffee (South Indian)', category: 'Beverage', brand: 'Indian', calories: 60, protein: 1.5, carbohydrates: 9.0, fat: 2.0, servingSize: '1 cup (150ml)' },

  // ── CONDIMENTS & CHUTNEYS ─────────────────────────────────────────────────
  { name: 'Coconut Chutney',         category: 'Condiment', brand: 'Indian', calories: 140, protein: 2.0, carbohydrates: 10.0, fat: 10.0, servingSize: '2 tbsp (30g)' },
  { name: 'Mint Chutney (Pudina)',   category: 'Condiment', brand: 'Indian', calories: 45,  protein: 1.5, carbohydrates: 6.5,  fat: 1.5,  servingSize: '2 tbsp (30g)' },
  { name: 'Tomato Chutney',          category: 'Condiment', brand: 'Indian', calories: 55,  protein: 1.0, carbohydrates: 10.5, fat: 1.0,  servingSize: '2 tbsp (30g)' },
  { name: 'Ghee',                    category: 'Condiment', brand: 'Indian', calories: 900, protein: 0.0, carbohydrates: 0.0,  fat: 99.5, servingSize: '1 tsp (5g)' },
  { name: 'Pickle (Mixed Veg Achar)',category: 'Condiment', brand: 'Indian', calories: 125, protein: 1.5, carbohydrates: 10.0, fat: 9.0,  servingSize: '1 tbsp (15g)' },
  { name: 'Papad (Roasted)',         category: 'Condiment', brand: 'Indian', calories: 380, protein: 22.0, carbohydrates: 58.0, fat: 4.5,  servingSize: '1 piece (10g)' },
  { name: 'Raita (Onion Tomato)',    category: 'Condiment', brand: 'Indian', calories: 60,  protein: 3.0, carbohydrates: 6.0,  fat: 2.5,  servingSize: '1/2 cup (100g)' },
  { name: 'Boondi Raita',            category: 'Condiment', brand: 'Indian', calories: 95,  protein: 3.5, carbohydrates: 12.0, fat: 3.5,  servingSize: '1/2 cup (100g)' },

  // ── DAIRY ─────────────────────────────────────────────────────────────────
  { name: 'Paneer (Cottage Cheese)', category: 'Dairy', brand: 'Indian', calories: 265, protein: 18.3, carbohydrates: 1.2, fat: 20.8, servingSize: '100g' },
  { name: 'Curd (Plain Yogurt)',     category: 'Dairy', brand: 'Indian', calories: 98,  protein: 3.5,  carbohydrates: 11.0, fat: 4.3,  servingSize: '1 cup (150g)' },
  { name: 'Milk (Whole, Full Fat)',  category: 'Dairy', brand: 'Indian', calories: 61,  protein: 3.2,  carbohydrates: 4.8,  fat: 3.3,  servingSize: '1 cup (244ml)' },
  { name: 'Milk (Toned 2%)',         category: 'Dairy', brand: 'Indian', calories: 50,  protein: 3.5,  carbohydrates: 4.9,  fat: 1.5,  servingSize: '1 cup (244ml)' },

  // ── FRUITS ────────────────────────────────────────────────────────────────
  { name: 'Mango (Alphonso)',        category: 'Fruit', brand: 'Indian', calories: 65,  protein: 0.5, carbohydrates: 15.0, fat: 0.3,  servingSize: '100g' },
  { name: 'Banana (Indian)',         category: 'Fruit', brand: 'Indian', calories: 89,  protein: 1.1, carbohydrates: 23.0, fat: 0.3,  servingSize: '1 medium (100g)' },
  { name: 'Guava (Amrood)',          category: 'Fruit', brand: 'Indian', calories: 68,  protein: 2.6, carbohydrates: 14.0, fat: 1.0,  servingSize: '1 medium (100g)' },
  { name: 'Papaya',                  category: 'Fruit', brand: 'Indian', calories: 43,  protein: 0.5, carbohydrates: 10.8, fat: 0.3,  servingSize: '1 cup (140g)' },
  { name: 'Jackfruit (Kathal)',      category: 'Fruit', brand: 'Indian', calories: 95,  protein: 1.7, carbohydrates: 23.0, fat: 0.6,  servingSize: '100g' },
  { name: 'Pomegranate (Anar)',      category: 'Fruit', brand: 'Indian', calories: 83,  protein: 1.7, carbohydrates: 18.7, fat: 1.2,  servingSize: '1 cup seeds (174g)' },
  { name: 'Chikoo (Sapota)',         category: 'Fruit', brand: 'Indian', calories: 83,  protein: 0.4, carbohydrates: 20.0, fat: 1.1,  servingSize: '1 medium (100g)' },

  // ── GRAINS & LEGUMES (RAW / COOKED) ──────────────────────────────────────
  { name: 'Oats (Rolled)',           category: 'Grain', brand: 'Generic', calories: 389, protein: 17.0, carbohydrates: 66.0, fat: 6.9,  servingSize: '1 cup dry (81g)' },
  { name: 'Quinoa (Cooked)',         category: 'Grain', brand: 'Generic', calories: 120, protein: 4.4,  carbohydrates: 21.3, fat: 1.9,  servingSize: '1 cup (185g)' },
  { name: 'Sprouts (Mixed Beans)',   category: 'Legume', brand: 'Indian', calories: 60,  protein: 4.5,  carbohydrates: 9.0,  fat: 0.5,  servingSize: '1 cup (100g)' },
  { name: 'Rajma (Raw Kidney Beans)', category: 'Legume', brand: 'Indian', calories: 333, protein: 23.0, carbohydrates: 58.0, fat: 0.8, servingSize: '100g raw' },
  { name: 'Chana (Chickpeas, Cooked)', category: 'Legume', brand: 'Indian', calories: 164, protein: 8.9, carbohydrates: 27.0, fat: 2.6, servingSize: '1 cup (164g)' },

];

async function seedIndianFoods() {
  const Food = require('../models/Food');

  const existingCount = await Food.countDocuments({ brand: 'Indian' });
  if (existingCount >= 50) {
    console.log(`✅ Already ${existingCount} Indian foods in DB — skipping seed.`);
    return;
  }

  // Remove old small seed set before inserting full set
  await Food.deleteMany({ brand: 'Indian' });
  console.log(`🗑️  Cleared old Indian food entries.`);

  await Food.insertMany(INDIAN_FOODS);
  console.log(`✅ Seeded ${INDIAN_FOODS.length} Indian food items successfully!`);
}

// ─── Export for use by seed.js ────────────────────────────────────────────────
module.exports = { INDIAN_FOODS };

// ─── Standalone runner (only when called directly) ────────────────────────────
if (isStandalone) {
  const mongoose = require('mongoose');
  const path = require('path');
  const LOCAL_DB_PATH = path.join(__dirname, '../../local_db_data');

  async function connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || '', { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Connected to MongoDB Atlas');
    } catch {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: { dbPath: LOCAL_DB_PATH, storageEngine: 'wiredTiger' },
      });
      await mongoose.connect(mongod.getUri('nutritrack'));
      console.log('✅ Connected to Persistent Local MongoDB');
    }
  }

  async function main() {
    await connect();
    await seedIndianFoods();
    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  }

  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
