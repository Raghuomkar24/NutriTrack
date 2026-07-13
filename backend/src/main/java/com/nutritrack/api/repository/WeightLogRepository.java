package com.nutritrack.api.repository;

import com.nutritrack.api.model.WeightLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeightLogRepository extends JpaRepository<WeightLog, Long> {
    Optional<WeightLog> findByUserIdAndDate(Long userId, LocalDate date);

    List<WeightLog> findByUserIdOrderByDateAsc(Long userId);

    List<WeightLog> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
