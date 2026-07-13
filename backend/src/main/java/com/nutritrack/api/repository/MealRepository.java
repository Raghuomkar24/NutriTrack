package com.nutritrack.api.repository;

import com.nutritrack.api.model.Meal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealRepository extends JpaRepository<Meal, Long> {
    List<Meal> findByUserIdAndDate(Long userId, LocalDate date);

    List<Meal> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    Optional<Meal> findByUserIdAndDateAndMealType(Long userId, LocalDate date, String mealType);
}
