package com.nutritrack.api.repository;

import com.nutritrack.api.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByUserIdOrderByCreatedAtDesc(Long userId);
}
