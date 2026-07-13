package com.nutritrack.api.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.nutritrack.api.model.*;
import com.nutritrack.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private MealRepository mealRepository;

    @Autowired
    private WaterLogRepository waterLogRepository;

    @Autowired
    private WeightLogRepository weightLogRepository;

    public ByteArrayInputStream generatePdfReport(User user, UserProfile profile, int days) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(22, 163, 74));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(30, 41, 59));

            // Title
            Paragraph title = new Paragraph("NutriTrack Pro - Health Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(15);
            document.add(title);

            // Subtitle metadata
            Paragraph metadata = new Paragraph("Generated on: " + LocalDate.now() + " | Profile: " + (profile != null ? profile.getName() : user.getEmail()), normalFont);
            metadata.setAlignment(Element.ALIGN_CENTER);
            metadata.setSpacingAfter(25);
            document.add(metadata);

            // Summary Info Section
            if (profile != null) {
                Paragraph sectionHeader = new Paragraph("User Profile Summary", subtitleFont);
                sectionHeader.setSpacingAfter(10);
                document.add(sectionHeader);

                PdfPTable profileTable = new PdfPTable(4);
                profileTable.setWidthPercentage(100);
                profileTable.setSpacingAfter(20);

                addTableCell(profileTable, "Age", headerFont, new Color(16, 185, 129));
                addTableCell(profileTable, "Weight", headerFont, new Color(16, 185, 129));
                addTableCell(profileTable, "Height", headerFont, new Color(16, 185, 129));
                addTableCell(profileTable, "Daily Target", headerFont, new Color(16, 185, 129));

                addTableCell(profileTable, String.valueOf(profile.getAge()), normalFont, null);
                addTableCell(profileTable, profile.getWeight() + " kg", normalFont, null);
                addTableCell(profileTable, profile.getHeight() + " cm", normalFont, null);
                addTableCell(profileTable, profile.getDailyCalories() + " kcal", normalFont, null);

                document.add(profileTable);
            }

            // Historical Data (Recent Meal Summaries)
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(days);
            List<Meal> meals = mealRepository.findByUserIdAndDateBetween(user.getId(), startDate, endDate);

            Paragraph mealHeader = new Paragraph("Recent Food & Calorie Intake Log", subtitleFont);
            mealHeader.setSpacingAfter(10);
            document.add(mealHeader);

            PdfPTable mealTable = new PdfPTable(5);
            mealTable.setWidthPercentage(100);
            mealTable.setSpacingAfter(20);

            addTableCell(mealTable, "Date", headerFont, new Color(22, 163, 74));
            addTableCell(mealTable, "Type", headerFont, new Color(22, 163, 74));
            addTableCell(mealTable, "Calories (kcal)", headerFont, new Color(22, 163, 74));
            addTableCell(mealTable, "Carbs (g)", headerFont, new Color(22, 163, 74));
            addTableCell(mealTable, "Protein (g)", headerFont, new Color(22, 163, 74));

            for (Meal meal : meals) {
                addTableCell(mealTable, meal.getDate().toString(), normalFont, null);
                addTableCell(mealTable, meal.getMealType(), normalFont, null);
                addTableCell(mealTable, String.valueOf(meal.getTotalCalories()), normalFont, null);
                addTableCell(mealTable, String.valueOf(meal.getTotalCarbs()), normalFont, null);
                addTableCell(mealTable, String.valueOf(meal.getTotalProtein()), normalFont, null);
            }

            if (meals.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No meals logged for this period.", normalFont));
                emptyCell.setColspan(5);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                mealTable.addCell(emptyCell);
            }

            document.add(mealTable);

            // Water & Weight summary
            List<WaterLog> waterLogs = waterLogRepository.findByUserIdAndDateBetween(user.getId(), startDate, endDate);
            Paragraph logsHeader = new Paragraph("Water and Weight Logs", subtitleFont);
            logsHeader.setSpacingAfter(10);
            document.add(logsHeader);

            PdfPTable logsTable = new PdfPTable(3);
            logsTable.setWidthPercentage(100);
            logsTable.setSpacingAfter(20);

            addTableCell(logsTable, "Date", headerFont, new Color(30, 41, 59));
            addTableCell(logsTable, "Water Logged (ml)", headerFont, new Color(30, 41, 59));
            addTableCell(logsTable, "Weight Tracker (kg)", headerFont, new Color(30, 41, 59));

            for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                final LocalDate currentDate = date;
                int waterMl = waterLogs.stream()
                        .filter(l -> l.getDate().equals(currentDate))
                        .mapToInt(WaterLog::getAmountMl)
                        .sum();

                Double currentWeight = weightLogRepository.findByUserIdAndDate(user.getId(), currentDate)
                        .map(WeightLog::getWeight)
                        .orElse(null);

                addTableCell(logsTable, currentDate.toString(), normalFont, null);
                addTableCell(logsTable, waterMl > 0 ? waterMl + " ml" : "-", normalFont, null);
                addTableCell(logsTable, currentWeight != null ? currentWeight + " kg" : "-", normalFont, null);
            }

            document.add(logsTable);

            // Closing Notes
            Paragraph footer = new Paragraph("Stay dedicated to your goal. Consistency is the key to healthy living!", FontFactory.getFont(FontFactory.HELVETICA, 10, Font.ITALIC, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addTableCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        if (bgColor != null) {
            cell.setBackgroundColor(bgColor);
        }
        table.addCell(cell);
    }
}
