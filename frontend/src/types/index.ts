// Core Domain Models

export interface UserProfile {
  name: string;
  mobile?: string;
  age?: number;
  gender?: string;
  height?: number; // cm
  weight?: number; // kg
  targetWeight?: number; // kg
  activityLevel?: string;
  goal?: string;
  bmi?: number;
  bmr?: number;
  tdee?: number;
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  diet?: string;
}

export interface User {
  _id: string;
  id?: string;
  email: string;
  roles: string[];
  profile: UserProfile;
  favorites?: string[]; // array of Food IDs
  createdAt?: string;
  updatedAt?: string;
}

export interface Food {
  _id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  vitamin_a?: number;
  vitamin_b?: number;
  vitamin_c?: number;
  vitamin_d?: number;
  vitamin_e?: number;
  serving_size?: string;
  image_url?: string;
  category_id?: number;
}

export interface MealItem {
  _id?: string;
  food: Food | string;
  quantity_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  _id: string;
  id?: string;
  user?: string;
  date: string;
  mealType: string;
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardSummary {
  dailyCaloriesGoal: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  proteinConsumed: number;
  dailyProteinGoal: number;
  carbsConsumed: number;
  dailyCarbsGoal: number;
  fatConsumed: number;
  dailyFatGoal: number;
  todayMeals: (Omit<Meal, '_id'> & { id: string, mealItems: MealItem[] })[];
  waterConsumedMl: number;
  waterGoal: number;
}

export interface WaterLog {
  _id?: string;
  id?: string;
  user?: string;
  date: string;
  amount_ml: number;
  amountMl?: number; // Support backend camelCase conversion
}

export interface WeightLog {
  _id?: string;
  id?: string;
  user?: string;
  date: string;
  weight: number;
  bmi: number;
}

export interface ExerciseLog {
  _id?: string;
  id?: string;
  user?: string;
  date: string;
  exerciseType: string;
  durationMinutes: number;
  caloriesBurned: number;
  distanceKm?: number;
  route?: number[][];
}

export interface Goal {
  _id?: string;
  id?: string;
  user?: string;
  activityType: string;
  targetDistanceKm: number;
  timeframe: string;
  completed?: boolean;
}

export interface RecipeIngredient {
  ingredient: {
    _id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | string;
  quantity_g: number;
}

export interface Recipe {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  instructions?: string;
  image_url?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  created_by?: string;
  recipeIngredients: RecipeIngredient[];
}

export interface Notification {
  id: string | number;
  _id?: string;
  message: string;
  isRead: boolean;
  type?: string;
}

// Error Interface
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
