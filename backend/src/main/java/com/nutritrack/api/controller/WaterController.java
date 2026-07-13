package com.nutritrack.api.controller;

import com.nutritrack.api.config.UserDetailsImpl;
import com.nutritrack.api.model.User;
import com.nutritrack.api.model.WaterLog;
import com.nutritrack.api.repository.UserRepository;
import com.nutritrack.api.repository.WaterLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/water")
public class WaterController {

    @Autowired
    private WaterLogRepository waterLogRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<WaterLog> getWater(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = getCurrentUser();
        WaterLog log = waterLogRepository.findByUserIdAndDate(user.getId(), date)
                .orElseGet(() -> {
                    WaterLog newLog = new WaterLog();
                    newLog.setUser(user);
                    newLog.setDate(date);
                    newLog.setAmountMl(0);
                    return newLog;
                });
        return ResponseEntity.ok(log);
    }

    @PostMapping
    public ResponseEntity<WaterLog> updateWater(@RequestBody Map<String, Object> body) {
        User user = getCurrentUser();
        LocalDate date = LocalDate.parse(body.get("date").toString());
        Integer amountMl = Integer.parseInt(body.get("amountMl").toString());

        WaterLog waterLog = waterLogRepository.findByUserIdAndDate(user.getId(), date)
                .orElse(new WaterLog());

        waterLog.setUser(user);
        waterLog.setDate(date);
        waterLog.setAmountMl(amountMl);

        WaterLog savedLog = waterLogRepository.save(waterLog);
        return ResponseEntity.ok(savedLog);
    }
}
