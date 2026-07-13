package com.nutritrack.api.repository;

import com.nutritrack.api.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByCreatedById(Long userId);

    @Query("SELECT r FROM Recipe r WHERE r.createdBy.id = :userId OR r.createdBy IS NULL")
    List<Recipe> findByCreatedByIdOrPublic(@Param("userId") Long userId);
}
