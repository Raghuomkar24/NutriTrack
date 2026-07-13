package com.nutritrack.api.repository;

import com.nutritrack.api.model.WaterLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaterLogRepository extends JpaRepository<WaterLog, Long> {
    Optional<WaterLog> findByUserIdAndDate(Long userId, LocalDate date);

    List<WaterLog> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
