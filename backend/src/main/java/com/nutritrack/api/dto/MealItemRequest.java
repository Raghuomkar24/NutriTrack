package com.nutritrack.api.dto;

import lombok.Data;

@Data
public class MealItemRequest {
    private Long foodId;
    private Double quantityG;
}
