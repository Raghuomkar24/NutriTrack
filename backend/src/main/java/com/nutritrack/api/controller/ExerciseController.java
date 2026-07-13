package com.nutritrack.api.controller;

import com.nutritrack.api.config.UserDetailsImpl;
import com.nutritrack.api.model.ExerciseLog;
import com.nutritrack.api.model.User;
import com.nutritrack.api.repository.ExerciseLogRepository;
import com.nutritrack.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exercise")
public class ExerciseController {

    @Autowired
    private ExerciseLogRepository exerciseLogRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<ExerciseLog>> getExercises(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = getCurrentUser();
        List<ExerciseLog> logs = exerciseLogRepository.findByUserIdAndDate(user.getId(), date);
        return ResponseEntity.ok(logs);
    }

    @PostMapping
    public ResponseEntity<ExerciseLog> logExercise(@RequestBody Map<String, Object> body) {
        User user = getCurrentUser();
        LocalDate date = LocalDate.parse(body.get("date").toString());
        String exerciseType = body.get("exerciseType").toString().toUpperCase();
        Integer durationMinutes = Integer.parseInt(body.get("durationMinutes").toString());
        Double caloriesBurned = Double.parseDouble(body.get("caloriesBurned").toString());

        ExerciseLog log = new ExerciseLog();
        log.setUser(user);
        log.setDate(date);
        log.setExerciseType(exerciseType);
        log.setDurationMinutes(durationMinutes);
        log.setCaloriesBurned(caloriesBurned);

        ExerciseLog savedLog = exerciseLogRepository.save(log);
        return ResponseEntity.ok(savedLog);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExercise(@PathVariable("id") Long id) {
        ExerciseLog log = exerciseLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise log not found"));

        User user = getCurrentUser();
        if (!log.getUser().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unauthorized to delete this log."));
        }

        exerciseLogRepository.delete(log);
        return ResponseEntity.ok(Map.of("message", "Exercise log deleted successfully."));
    }
}
