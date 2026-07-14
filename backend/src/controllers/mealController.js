const Meal = require('../models/Meal');
const Food = require('../models/Food');

exports.logMeal = async (req, res) => {
  try {
    const { date, mealType, items } = req.body;
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const populatedItems = [];

    for (let item of items) {
      const food = await Food.findById(item.foodId);
      if (food) {
        const factor = item.quantityG / 100;
        const cal = food.calories * factor;
        const pro = food.protein * factor;
        const car = food.carbohydrates * factor;
        const fat = food.fat * factor;
        
        totalCalories += cal;
        totalProtein += pro;
        totalCarbs += car;
        totalFat += fat;

        populatedItems.push({
          food: food._id,
          quantity_g: item.quantityG,
          calories: cal,
          protein: pro,
          carbs: car,
          fat: fat
        });
      }
    }

    const meal = await Meal.create({
      user: req.user.id,
      date: new Date(date),
      mealType,
      items: populatedItems,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    });

    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    const { id } = req.params;
    await Meal.findOneAndDelete({ _id: id, user: req.user.id });
    res.json({ message: 'Meal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
