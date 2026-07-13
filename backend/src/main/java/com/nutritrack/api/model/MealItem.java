package com.nutritrack.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "meal_items")
@Data
@NoArgsConstructor
public class MealItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", nullable = false)
    @JsonIgnore
    private Meal meal;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "food_id")
    private Food food;

    @Column(name = "quantity_g", nullable = false)
    private Double quantityG = 100.0;

    private Double calories = 0.0;
    private Double protein = 0.0;
    private Double carbs = 0.0;
    private Double fat = 0.0;
}
