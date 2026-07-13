package com.nutritrack.api.repository;

import com.nutritrack.api.model.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {
    Optional<Food> findByBarcode(String barcode);

    List<Food> findByNameContainingIgnoreCaseOrBrandContainingIgnoreCase(String name, String brand);

    List<Food> findByCategoryId(Integer categoryId);

    @Query("SELECT f FROM Food f WHERE f.createdBy = :createdBy OR f.createdBy = 'SYSTEM'")
    List<Food> findByCreatedByOrSystem(@Param("createdBy") String createdBy);
}
