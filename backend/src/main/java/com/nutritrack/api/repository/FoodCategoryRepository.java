package com.nutritrack.api.repository;

import com.nutritrack.api.model.FoodCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FoodCategoryRepository extends JpaRepository<FoodCategory, Integer> {
    Optional<FoodCategory> findByName(String name);
}
