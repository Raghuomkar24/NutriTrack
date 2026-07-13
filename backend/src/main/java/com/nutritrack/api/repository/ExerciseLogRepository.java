package com.nutritrack.api.repository;

import com.nutritrack.api.model.ExerciseLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseLogRepository extends JpaRepository<ExerciseLog, Long> {
    List<ExerciseLog> findByUserIdAndDate(Long userId, LocalDate date);

    List<ExerciseLog> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
