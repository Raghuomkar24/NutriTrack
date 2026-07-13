package com.nutritrack.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutritrack.api.model.Food;
import com.nutritrack.api.repository.FoodRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Service
@Slf4j
public class OpenFoodFactsService {

    @Autowired
    private FoodRepository foodRepository;

    @Value("${external-apis.openfoodfacts.url}")
    private String openFoodFactsUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Optional<Food> lookupBarcode(String barcode) {
        // First check internal database (this enables our seeded items to match immediately!)
        Optional<Food> internalFood = foodRepository.findByBarcode(barcode);
        if (internalFood.isPresent()) {
            return internalFood;
        }

        try {
            String url = openFoodFactsUrl + "/product/" + barcode + ".json";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                int status = root.path("status").asInt();
                if (status == 1) {
                    JsonNode product = root.path("product");
                    Food food = new Food();
                    food.setName(product.path("product_name").asText("Unknown Product"));
                    food.setBrand(product.path("brands").asText("Unknown Brand"));
                    food.setBarcode(barcode);
                    food.setIngredients(product.path("ingredients_text").asText(""));
                    food.setImageUrl(product.path("image_url").asText("https://images.unsplash.com/photo-1546069901-ba9599a7e63c"));

                    JsonNode nutriments = product.path("nutriments");
                    food.setCalories(nutriments.path("energy-kcal_100g").asDouble(0.0));
                    if (food.getCalories() == 0.0) {
                        // fallback to energy-kj
                        double kj = nutriments.path("energy_100g").asDouble(0.0);
                        food.setCalories(Math.round(kj / 4.184 * 10.0) / 10.0);
                    }
                    food.setProtein(nutriments.path("proteins_100g").asDouble(0.0));
                    food.setFat(nutriments.path("fat_100g").asDouble(0.0));
                    food.setCarbohydrates(nutriments.path("carbohydrates_100g").asDouble(0.0));
                    food.setFiber(nutriments.path("fiber_100g").asDouble(0.0));
                    food.setSugar(nutriments.path("sugars_100g").asDouble(0.0));
                    food.setSodium(nutriments.path("sodium_100g").asDouble(0.0) * 1000); // g to mg

                    food.setServingSize(product.path("serving_size").asText("100g"));
                    food.setCreatedBy("OPEN_FOOD_FACTS");

                    // Save the newly discovered food so it is cached locally!
                    return Optional.of(foodRepository.save(food));
                }
            }
        } catch (Exception e) {
            log.error("Failed to query Open Food Facts for barcode {}: {}", barcode, e.getMessage());
        }

        return Optional.empty();
    }
}
