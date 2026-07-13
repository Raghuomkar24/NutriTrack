package com.nutritrack.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String mobile;

    private Integer age;
    private String gender; // MALE, FEMALE
    private Double height; // in cm
    private Double weight; // in kg

    @Column(name = "target_weight")
    private Double targetWeight; // in kg

    @Column(name = "activity_level")
    private String activityLevel; // SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, EXTRA_ACTIVE

    private String goal; // LOSE_WEIGHT, MAINTAIN, GAIN_MUSCLE

    private Double bmi;
    private Double bmr;
    private Double tdee;

    @Column(name = "daily_calories")
    private Double dailyCalories;

    @Column(name = "daily_protein")
    private Double dailyProtein;

    @Column(name = "daily_carbs")
    private Double dailyCarbs;

    @Column(name = "daily_fat")
    private Double dailyFat;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
