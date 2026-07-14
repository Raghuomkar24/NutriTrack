const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const upload = multer({ dest: 'uploads/' });

// Initialize Gemini if key is provided
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

router.post('/recognize', protect, upload.single('file'), async (req, res) => {
  const user = await require('../models/User').findById(req.user.id);
  const isVeg = user?.profile?.diet === 'VEGETARIAN';

  // 1. Try real Gemini AI Vision
  if (ai && req.file) {
    try {
      const fileBytes = fs.readFileSync(req.file.path).toString("base64");
      
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: [
              {
                  role: 'user',
                  parts: [
                      { inlineData: { mimeType: req.file.mimetype, data: fileBytes } },
                      { text: 'Analyze this food. Respond in JSON format only with the following keys: mealName (string), confidenceScore (number between 0 and 1), estimatedCalories (number), estimatedProtein (number in grams), estimatedCarbs (number in grams), estimatedFat (number in grams), itemsDetected (array of strings).' }
                  ]
              }
          ],
          config: {
            responseMimeType: "application/json",
          }
      });

      // Cleanup upload
      fs.unlinkSync(req.file.path);
      
      const parsed = JSON.parse(response.text);
      return res.json(parsed);
    } catch (error) {
      console.error("Gemini Vision Error, falling back to mock:", error);
      // Cleanup on error
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
  }

  // 2. Fallback to Mock
  if (req.file && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path); // cleanup mock file too
  }

  if (isVeg) {
    res.json({
      mealName: 'Grilled Paneer Salad',
      confidenceScore: 0.94,
      estimatedCalories: 320,
      estimatedProtein: 28,
      estimatedCarbs: 15,
      estimatedFat: 20,
      itemsDetected: ['Paneer', 'Lettuce', 'Tomatoes', 'Olive Oil']
    });
  } else {
    res.json({
      mealName: 'Grilled Chicken Salad',
      confidenceScore: 0.92,
      estimatedCalories: 350,
      estimatedProtein: 35,
      estimatedCarbs: 12,
      estimatedFat: 18,
      itemsDetected: ['Chicken Breast', 'Lettuce', 'Tomatoes', 'Olive Oil']
    });
  }
});

router.post('/chat', protect, async (req, res) => {
  const user = await require('../models/User').findById(req.user.id);
  const isVeg = user?.profile?.diet === 'VEGETARIAN';
  const dietString = isVeg ? 'vegetarian' : 'non-vegetarian';
  const userMessage = req.body.message;
  
  // 1. Try real Gemini AI Chat
  if (ai && userMessage) {
    try {
      const prompt = `You are NutriTrack Pro, an expert AI nutritionist. The user follows a ${dietString} diet and their goal is to ${user?.profile?.goal?.replace('_', ' ') || 'maintain health'}. Respond to the user concisely and helpfully in markdown. User says: "${userMessage}"`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return res.json({ response: response.text });
    } catch(err) {
      console.error("Gemini Chat Error, falling back to mock:", err);
    }
  }

  // 2. Fallback Mock response
  res.json({
    response: `As an AI Coach, I noticed you follow a **${dietString}** diet. Based on your profile and goals, I recommend focusing on high-protein ${isVeg ? 'plant-based sources like lentils, tofu, and paneer' : 'sources like chicken, fish, and eggs'} to keep you full and meet your macro targets!`
  });
});

module.exports = router;
