package com.nutritrack.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutritrack.api.model.UserProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class AiCoachService {

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getResponse(String userPrompt, UserProfile profile) {
        if (apiKey == null || apiKey.isEmpty() || "mock-key".equalsIgnoreCase(apiKey)) {
            log.info("OpenAI API Key is missing or default. Falling back to Simulated AI responses.");
            return generateMockResponse(userPrompt, profile);
        }

        try {
            String systemInstructions = "You are a professional nutrition and health coach at NutriTrack Pro. "
                    + "Help the user achieve their goals. Here is the user's profile details:\n";
            if (profile != null) {
                systemInstructions += "- Name: " + profile.getName() + "\n"
                        + "- Age: " + profile.getAge() + "\n"
                        + "- Goal: " + profile.getGoal() + "\n"
                        + "- Weight: " + profile.getWeight() + " kg\n"
                        + "- Daily Target Calories: " + profile.getDailyCalories() + " kcal\n"
                        + "- Daily Target Protein: " + profile.getDailyProtein() + " g\n"
                        + "- Daily Target Carbs: " + profile.getDailyCarbs() + " g\n"
                        + "- Daily Target Fat: " + profile.getDailyFat() + " g\n";
            } else {
                systemInstructions += "- No profile created yet.";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemInstructions));
            messages.add(Map.of("role", "user", "content", userPrompt));
            body.put("messages", messages);
            body.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions", request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").path(0).path("message").path("content").asText();
        } catch (Exception e) {
            log.error("Failed to query OpenAI. Falling back to Simulated response. Error: {}", e.getMessage());
            return generateMockResponse(userPrompt, profile);
        }
    }

    private String generateMockResponse(String prompt, UserProfile profile) {
        String query = prompt.toLowerCase();
        String goal = profile != null ? profile.getGoal() : "MAINTAIN";
        String name = profile != null ? profile.getName() : "User";

        if (query.contains("what should i eat") || query.contains("meal plan") || query.contains("recommend")) {
            if ("LOSE_WEIGHT".equalsIgnoreCase(goal)) {
                return "Hi " + name + "! To support your **Weight Loss** goal, I suggest a calorie-deficit meal plan featuring low-calorie, nutrient-dense foods:\n\n"
                        + "1. **Breakfast**: 3 scrambled egg whites with spinach (150 kcal, 18g Protein) + 40g rolled oats cooked in water (150 kcal).\n"
                        + "2. **Lunch**: 150g grilled chicken breast (180 kcal, 35g Protein) with a large mixed greens salad and 1 tbsp light olive oil vinaigrette.\n"
                        + "3. **Snack**: 150g plain non-fat Greek yogurt (90 kcal, 15g Protein) with a handful of fresh berries.\n"
                        + "4. **Dinner**: 150g baked salmon fillet (310 kcal, 30g Protein) served with steamed broccoli and 100g cooked brown rice.\n\n"
                        + "Total Calories: ~1300 kcal. This fits perfectly within your daily target. Keep logging your meals in the dashboard!";
            } else if ("GAIN_MUSCLE".equalsIgnoreCase(goal)) {
                return "Hey " + name + "! For **Muscle Gain**, we want a calorie surplus and plenty of protein to support muscle synthesis:\n\n"
                        + "1. **Breakfast**: 3 whole eggs scrambled with 2 slices of whole wheat toast and 1/2 avocado (~500 kcal, 25g Protein).\n"
                        + "2. **Lunch**: 200g lean beef sirloin (~400 kcal, 45g Protein) with 150g white jasmine rice (200 kcal) and roasted asparagus.\n"
                        + "3. **Post-Workout**: 1 scoop whey protein powder mixed with 250ml whole milk and 1 medium banana (~400 kcal, 35g Protein).\n"
                        + "4. **Dinner**: 200g grilled chicken breast (~300 kcal, 50g Protein) with 200g baked sweet potato and cooked spinach.\n\n"
                        + "Ensure you are sleeping 8 hours and logging your gym sessions in the Exercise tab!";
            } else {
                return "Hi " + name + "! For **Weight Maintenance**, balance is key:\n\n"
                        + "1. **Breakfast**: Oatmeal cooked in almond milk with 1 scoop protein powder, topped with walnuts and chia seeds.\n"
                        + "2. **Lunch**: Quinoa bowl with mixed vegetables, grilled tofu (or chicken), and tahini dressing.\n"
                        + "3. **Snack**: A handful of almonds and a red apple.\n"
                        + "4. **Dinner**: Grilled fish fillet with roasted potatoes and a side salad.\n\n"
                        + "Focus on whole foods, healthy fats, and drinking at least 2.5 liters of water daily.";
            }
        }

        if (query.contains("protein") || query.contains("high protein")) {
            return "To hit your target protein of " + (profile != null ? profile.getDailyProtein() : "100") + "g, incorporate these top high-protein items:\n\n"
                    + "- **Chicken Breast**: 31g protein per 100g\n"
                    + "- **Greek Yogurt**: 10g protein per 100g\n"
                    + "- **Cottage Cheese**: 11g protein per 100g\n"
                    + "- **Eggs**: 6g protein per egg\n"
                    + "- **Tofu**: 8g protein per 100g\n"
                    + "- **Salmon Fillet**: 22g protein per 100g\n"
                    + "- **Lentils**: 9g protein per 100g (cooked)\n\n"
                    + "I recommend logging a scoop of whey protein in the morning if you find yourself falling short!";
        }

        if (query.contains("analyze") || query.contains("today's nutrition") || query.contains("progress")) {
            return "Based on your recent logs:\n\n"
                    + "- **Caloric Intake**: You are currently on track. Ensure you distribute calories evenly to avoid energy crashes.\n"
                    + "- **Macronutrient Balance**: Your protein looks solid, but check if you are logging enough water (target: 2500ml).\n"
                    + "- **Advice**: Keep tracking your daily weights. Weight changes are normal due to water fluctuations. Stick to the plan for another 2 weeks before adjusting macros.";
        }

        return "Hi " + name + "! I am your NutriTrack Pro Coach. I can help you compile meal plans, suggest healthy alternatives, explain nutrition labels, or analyze your current progress. What would you like to discuss today?";
    }
}
