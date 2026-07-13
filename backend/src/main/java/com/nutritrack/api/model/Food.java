package com.nutritrack.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "foods")
@Data
@NoArgsConstructor
public class Food {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private FoodCategory category;

    private String brand;

    private Double calories = 0.0;
    private Double protein = 0.0;
    private Double fat = 0.0;
    private Double carbohydrates = 0.0;
    private Double fiber = 0.0;
    private Double sugar = 0.0;
    private Double sodium = 0.0;
    private Double cholesterol = 0.0;
    private Double potassium = 0.0;
    private Double calcium = 0.0;
    private Double iron = 0.0;

    @Column(name = "vitamin_a")
    private Double vitaminA = 0.0;

    @Column(name = "vitamin_b")
    private Double vitaminB = 0.0;

    @Column(name = "vitamin_c")
    private Double vitaminC = 0.0;

    @Column(name = "vitamin_d")
    private Double vitaminD = 0.0;

    @Column(name = "vitamin_e")
    private Double vitaminE = 0.0;

    @Column(name = "serving_size")
    private String servingSize = "100g";

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(unique = true, length = 100)
    private String barcode;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_by")
    private String createdBy = "SYSTEM";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
