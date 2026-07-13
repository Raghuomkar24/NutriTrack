package com.nutritrack.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    @NotBlank
    @Size(max = 100)
    private String name;

    private String mobile;
    private Integer age;
    private String gender; // MALE, FEMALE
    private Double height; // cm
    private Double weight; // kg
    private Double targetWeight; // kg
    private String activityLevel; // SEDENTARY, LIGHTLY_ACTIVE, etc.
    private String goal; // LOSE_WEIGHT, MAINTAIN, GAIN_MUSCLE
}
