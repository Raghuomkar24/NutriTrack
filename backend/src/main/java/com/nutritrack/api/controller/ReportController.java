package com.nutritrack.api.controller;

import com.nutritrack.api.config.UserDetailsImpl;
import com.nutritrack.api.model.Report;
import com.nutritrack.api.model.User;
import com.nutritrack.api.model.UserProfile;
import com.nutritrack.api.repository.ReportRepository;
import com.nutritrack.api.repository.UserRepository;
import com.nutritrack.api.service.ProfileService;
import com.nutritrack.api.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private ReportRepository reportRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Report>> getReports() {
        User user = getCurrentUser();
        return ResponseEntity.ok(reportRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @GetMapping("/download")
    public ResponseEntity<InputStreamResource> downloadReport(@RequestParam(name = "days", defaultValue = "7") int days) {
        User user = getCurrentUser();
        UserProfile profile = profileService.getProfileByUserId(user.getId());

        ByteArrayInputStream bis = reportService.generatePdfReport(user, profile, days);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=nutritrack_report.pdf");

        // Save report metadata
        Report report = new Report();
        report.setUser(user);
        report.setReportName("Nutrition_Report_" + LocalDateNowStr() + ".pdf");
        report.setFilePath("/downloads/nutritrack_report.pdf");
        reportRepository.save(report);

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    private String LocalDateNowStr() {
        return java.time.LocalDate.now().toString();
    }
}
