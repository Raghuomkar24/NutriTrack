const Recipe = require('../models/Recipe');
const ShoppingList = require('../models/ShoppingList');

const seedDefaultRecipes = async () => {
  try {
    const count = await Recipe.countDocuments();
    if (count === 0) {
      console.log('Seeding default recipes...');
      await Recipe.create([
        {
          name: 'Healthy Garlic Chicken and Broccoli Rice',
          description: 'A balanced meal prep containing grilled chicken breast, broccoli, and brown rice sautéed in garlic and olive oil.',
          instructions: '1. Boil brown rice according to packaging.\n2. Dice chicken breast and sauté in olive oil with minced garlic.\n3. Add broccoli florets to the skillet and cook until tender.\n4. Combine all ingredients in meal containers.',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
          calories: 450,
          protein: 35,
          fat: 12,
          carbs: 42,
          recipeIngredients: [
            { ingredient: { name: 'Chicken Breast', calories: 165, protein: 31, fat: 3.6, carbs: 0 }, quantityG: 150 },
            { ingredient: { name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fat: 0.9 }, quantityG: 100 },
            { ingredient: { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 }, quantityG: 100 },
            { ingredient: { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100 }, quantityG: 10 },
            { ingredient: { name: 'Garlic', calories: 149, protein: 6.4, carbs: 33, fat: 0.5 }, quantityG: 5 }
          ]
        },
        {
          name: 'Paneer Tikka Roll',
          description: 'A protein-packed delicious Indian vegetarian roll filled with marinated grilled paneer, onions, bell peppers, and mint chutney.',
          instructions: '1. Marinate paneer cubes, chopped onions, and bell peppers in spiced yogurt.\n2. Grill on a pan or oven until charred.\n3. Place on a whole wheat roti, drizzle mint chutney, wrap and serve.',
          imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0',
          calories: 380,
          protein: 18,
          fat: 15,
          carbs: 38,
          recipeIngredients: [
            { ingredient: { name: 'Paneer (Cottage Cheese)', calories: 265, protein: 18, fat: 20, carbs: 1.2 }, quantityG: 80 },
            { ingredient: { name: 'Whole Wheat Roti', calories: 297, protein: 9, carbs: 60, fat: 3 }, quantityG: 50 },
            { ingredient: { name: 'Yogurt (Curd)', calories: 98, protein: 3.5, carbs: 11, fat: 4.3 }, quantityG: 30 },
            { ingredient: { name: 'Onions & Bell Peppers', calories: 40, protein: 1, carbs: 9, fat: 0.2 }, quantityG: 50 }
          ]
        }
      ]);
      console.log('Default recipes seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding default recipes:', error);
  }
};

exports.getRecipes = async (req, res) => {
  try {
    await seedDefaultRecipes();
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateShoppingList = async (req, res) => {
  try {
    const recipeIds = req.body;
    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({ message: 'No recipes selected' });
    }

    const recipes = await Recipe.find({ _id: { $in: recipeIds } });
    if (recipes.length === 0) {
      return res.status(404).json({ message: 'Recipes not found' });
    }

    // Aggregate ingredients
    const ingredientMap = {};
    recipes.forEach(recipe => {
      recipe.recipeIngredients.forEach(item => {
        const name = item.ingredient.name;
        const qty = item.quantityG;
        if (ingredientMap[name]) {
          ingredientMap[name] += qty;
        } else {
          ingredientMap[name] = qty;
        }
      });
    });

    const items = Object.entries(ingredientMap)
      .map(([name, qty]) => `${name}:${qty}g`)
      .join(',');

    const shoppingList = await ShoppingList.create({
      user: req.user.id,
      name: recipes.length === 1 
        ? `Grocery Checklist for ${recipes[0].name}` 
        : `Checklist: ${recipes.length} Recipes`,
      items
    });

    res.status(201).json(shoppingList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getShoppingLists = async (req, res) => {
  try {
    const lists = await ShoppingList.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteShoppingList = async (req, res) => {
  try {
    const { id } = req.params;
    await ShoppingList.findOneAndDelete({ _id: id, user: req.user.id });
    res.json({ message: 'Shopping list deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
