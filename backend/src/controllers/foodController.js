const Food = require('../models/Food');
const User = require('../models/User');

exports.getFoods = async (req, res) => {
  try {
    const { q } = req.query;
    if (q) {
      // 1. Check local DB first for matches (prioritizing our seeded Indian foods)
      let localFoods = await Food.find({ name: { $regex: q, $options: 'i' } }).limit(20);
      
      // Sort local results to prioritize 'Indian' brand foods to the top
      localFoods.sort((a, b) => (b.brand === 'Indian' ? 1 : 0) - (a.brand === 'Indian' ? 1 : 0));

      // Performance Optimization: If we have 5 or more local results, return them immediately
      // to avoid making a slow external API request.
      if (localFoods.length >= 5) {
        return res.json(localFoods);
      }

      // 2. Fetch from Open Food Facts if not enough local results
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
          // Upsert each valid product into local DB
          for (const p of data.products) {
            if (p.product_name && p.nutriments && p.nutriments['energy-kcal_100g'] !== undefined) {
              await Food.findOneAndUpdate(
                { barcode: p.code },
                {
                  name: p.product_name || 'Unknown Product',
                  brand: p.brands || 'Generic',
                  calories: p.nutriments['energy-kcal_100g'] || 0,
                  protein: p.nutriments['proteins_100g'] || 0,
                  carbohydrates: p.nutriments['carbohydrates_100g'] || 0,
                  fat: p.nutriments['fat_100g'] || 0,
                  servingSize: p.serving_size || '100g'
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );
            }
          }
        }
      } catch (fetchErr) {
        console.warn("Failed to fetch from Open Food Facts API (offline or slow), utilizing local matches only:", fetchErr.message);
      }
      
      // 3. Query local DB again and sort Indian foods to top
      const finalFoods = await Food.find({ name: { $regex: q, $options: 'i' } }).limit(20);
      finalFoods.sort((a, b) => (b.brand === 'Indian' ? 1 : 0) - (a.brand === 'Indian' ? 1 : 0));
      return res.json(finalFoods);
    }
    
    // No query, just return recent local foods
    const foods = await Food.find().limit(20);
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFood = async (req, res) => {
  try {
    const food = await Food.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    
    const index = user.favorites.indexOf(id);
    if (index > -1) {
      user.favorites.splice(index, 1);
    } else {
      user.favorites.push(id);
    }
    
    await user.save();
    res.json({ message: 'Favorite toggled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFoodByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    
    // 1. Try local DB first
    let food = await Food.findOne({ barcode });
    if (food) return res.json(food);

    // 2. Try Open Food Facts
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      const p = data.product;
      
      // Upsert to local DB
      food = await Food.findOneAndUpdate(
        { barcode: p.code },
        {
          name: p.product_name || 'Unknown Product',
          brand: p.brands || 'Generic',
          calories: p.nutriments?.['energy-kcal_100g'] || 0,
          protein: p.nutriments?.['proteins_100g'] || 0,
          carbohydrates: p.nutriments?.['carbohydrates_100g'] || 0,
          fat: p.nutriments?.['fat_100g'] || 0,
          servingSize: p.serving_size || '100g'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      
      return res.json(food);
    }
    
    res.status(404).json({ message: 'Food not found for this barcode' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
