package com.nutritrack.api.dto;

import lombok.Data;

import java.util.List;

@Data
public class MealRequest {
    private String date; // LocalDate parsed as yyyy-MM-dd
    private String mealType; // BREAKFAST, LUNCH, etc.
    private List<MealItemRequest> items;
}
