package com.nutritrack.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "meals")
@Data
@NoArgsConstructor
public class Meal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "meal_type", nullable = false)
    private String mealType; // BREAKFAST, MORNING_SNACK, LUNCH, EVENING_SNACK, DINNER

    @Column(name = "total_calories")
    private Double totalCalories = 0.0;

    @Column(name = "total_protein")
    private Double totalProtein = 0.0;

    @Column(name = "total_carbs")
    private Double totalCarbs = 0.0;

    @Column(name = "total_fat")
    private Double totalFat = 0.0;

    @OneToMany(mappedBy = "meal", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MealItem> mealItems = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
