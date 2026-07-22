const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Meal = require('../models/Meal');
const { WaterLog, WeightLog, ExerciseLog } = require('../models/Tracking');

// ─── Color Palette ───────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10b981',       // emerald-500
  primaryDark: '#059669',   // emerald-600
  secondary: '#3b82f6',     // blue-500
  accent: '#f59e0b',        // amber-500
  danger: '#ef4444',        // red-500
  textDark: '#1e293b',      // slate-800
  textMedium: '#475569',    // slate-600
  textLight: '#94a3b8',     // slate-400
  bgLight: '#f8fafc',       // slate-50
  tableBorder: '#cbd5e1',   // slate-300
  tableHeaderBg: '#f1f5f9', // slate-100
  success: '#22c55e',       // green-500
  warning: '#f97316',       // orange-500
};

// ─── Helper: Draw a horizontal separator ─────────────────────────────────────
function drawSeparator(doc, color = COLORS.tableBorder) {
  doc.moveDown(0.5);
  const y = doc.y;
  doc.strokeColor(color).lineWidth(0.5)
    .moveTo(50, y).lineTo(doc.page.width - 50, y).stroke();
  doc.moveDown(0.5);
}

// ─── Helper: Draw a section header ───────────────────────────────────────────
function sectionHeader(doc, title, color = COLORS.primary) {
  checkPageBreak(doc, 60);
  doc.moveDown(0.8);
  // Colored accent bar
  const y = doc.y;
  doc.rect(50, y, 4, 20).fill(color);
  doc.fontSize(14).font('Helvetica-Bold').fillColor(color)
    .text(title, 62, y + 2);
  doc.moveDown(0.8);
}

// ─── Helper: Key-value pair line ─────────────────────────────────────────────
function kvLine(doc, label, value, labelColor = COLORS.textMedium, valueColor = COLORS.textDark) {
  const startX = doc.x;
  doc.fontSize(10).font('Helvetica-Bold').fillColor(labelColor).text(label, { continued: true });
  doc.font('Helvetica').fillColor(valueColor).text(`  ${value}`);
}

// ─── Helper: Page break check ────────────────────────────────────────────────
function checkPageBreak(doc, requiredSpace = 80) {
  if (doc.y + requiredSpace > doc.page.height - 60) {
    doc.addPage();
  }
}

// ─── Helper: Get date range ──────────────────────────────────────────────────
function getDateRange(days) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

// ─── Helper: Format date ─────────────────────────────────────────────────────
function fmtDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtShortDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Helper: Draw a simple table ─────────────────────────────────────────────
function drawTable(doc, headers, rows, colWidths, options = {}) {
  const startX = 50;
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const cellPadding = 6;
  const fontSize = 8.5;
  const headerHeight = 24;
  const rowHeight = 20;

  checkPageBreak(doc, headerHeight + rowHeight * Math.min(rows.length, 3) + 20);

  let currentY = doc.y;

  // Draw header row background
  doc.rect(startX, currentY, tableWidth, headerHeight).fill(COLORS.tableHeaderBg);
  doc.rect(startX, currentY, tableWidth, headerHeight)
    .strokeColor(COLORS.tableBorder).lineWidth(0.5).stroke();

  // Draw header text
  let xOffset = startX;
  headers.forEach((header, i) => {
    doc.fontSize(fontSize).font('Helvetica-Bold').fillColor(COLORS.textDark)
      .text(header, xOffset + cellPadding, currentY + 7, {
        width: colWidths[i] - cellPadding * 2,
        align: i === 0 ? 'left' : 'center'
      });
    xOffset += colWidths[i];
  });

  currentY += headerHeight;

  // Draw data rows
  rows.forEach((row, rowIndex) => {
    checkPageBreak(doc, rowHeight + 10);
    currentY = doc.y;

    // Alternate row background
    if (rowIndex % 2 === 0) {
      doc.rect(startX, currentY, tableWidth, rowHeight).fill('#ffffff');
    } else {
      doc.rect(startX, currentY, tableWidth, rowHeight).fill(COLORS.bgLight);
    }
    doc.rect(startX, currentY, tableWidth, rowHeight)
      .strokeColor(COLORS.tableBorder).lineWidth(0.3).stroke();

    xOffset = startX;
    row.forEach((cell, i) => {
      const cellColor = (options.highlightColumn && options.highlightColumn.col === i && options.highlightColumn.check)
        ? options.highlightColumn.check(cell, row) : COLORS.textMedium;

      doc.fontSize(fontSize).font('Helvetica').fillColor(cellColor)
        .text(String(cell), xOffset + cellPadding, currentY + 5, {
          width: colWidths[i] - cellPadding * 2,
          align: i === 0 ? 'left' : 'center'
        });
      xOffset += colWidths[i];
    });

    doc.y = currentY + rowHeight;
  });
}

// ─── Helper: Draw a stat box ─────────────────────────────────────────────────
function drawStatBox(doc, x, y, width, label, value, unit, color) {
  // Background
  doc.roundedRect(x, y, width, 55, 6).fill('#ffffff');
  doc.roundedRect(x, y, width, 55, 6).strokeColor(COLORS.tableBorder).lineWidth(0.5).stroke();

  // Color accent line at top
  doc.rect(x, y, width, 3).fill(color);
  doc.roundedRect(x, y, width, 3, 3).fill(color); // top-rounded

  // Value
  doc.fontSize(18).font('Helvetica-Bold').fillColor(color)
    .text(value, x, y + 12, { width, align: 'center' });

  // Unit
  doc.fontSize(7).font('Helvetica').fillColor(COLORS.textLight)
    .text(unit, x, y + 32, { width, align: 'center' });

  // Label
  doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.textMedium)
    .text(label, x, y + 42, { width, align: 'center' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

exports.downloadReport = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { days } = req.query;
    const reportDays = parseInt(days) || 7;
    const reportType = reportDays <= 7 ? 'Weekly' : 'Monthly';
    const { start, end } = getDateRange(reportDays);

    // ── Fetch all data ───────────────────────────────────────────────────────
    const [meals, waterLogs, weightLogs, exerciseLogs] = await Promise.all([
      Meal.find({ user: req.user.id, date: { $gte: start, $lte: end } }).populate('items.food').sort({ date: 1 }),
      WaterLog.find({ user: req.user.id, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
      WeightLog.find({ user: req.user.id, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
      ExerciseLog.find({ user: req.user.id, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
    ]);

    // ── Aggregate daily data ─────────────────────────────────────────────────
    const dailyMap = {};
    for (let i = 0; i < reportDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0, mealCount: 0 };
    }

    meals.forEach(m => {
      const key = new Date(m.date).toISOString().split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].calories += m.totalCalories || 0;
        dailyMap[key].protein += m.totalProtein || 0;
        dailyMap[key].carbs += m.totalCarbs || 0;
        dailyMap[key].fat += m.totalFat || 0;
        dailyMap[key].mealCount += 1;
      }
    });

    waterLogs.forEach(w => {
      const key = new Date(w.date).toISOString().split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].water += w.amount_ml || 0;
      }
    });

    // ── Compute totals and averages ──────────────────────────────────────────
    const dailyEntries = Object.entries(dailyMap);
    const daysWithData = dailyEntries.filter(([, d]) => d.mealCount > 0).length || 1;

    let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalWater = 0, totalMeals = 0;
    dailyEntries.forEach(([, d]) => {
      totalCals += d.calories;
      totalProtein += d.protein;
      totalCarbs += d.carbs;
      totalFat += d.fat;
      totalWater += d.water;
      totalMeals += d.mealCount;
    });

    const avgCals = Math.round(totalCals / daysWithData);
    const avgProtein = Math.round(totalProtein / daysWithData);
    const avgCarbs = Math.round(totalCarbs / daysWithData);
    const avgFat = Math.round(totalFat / daysWithData);
    const avgWater = Math.round(totalWater / (dailyEntries.filter(([, d]) => d.water > 0).length || 1));

    // ── Meal type distribution ───────────────────────────────────────────────
    const mealTypeMap = {};
    meals.forEach(m => {
      const type = m.mealType || 'OTHER';
      if (!mealTypeMap[type]) mealTypeMap[type] = { count: 0, calories: 0 };
      mealTypeMap[type].count += 1;
      mealTypeMap[type].calories += m.totalCalories || 0;
    });

    // ── Exercise aggregation ─────────────────────────────────────────────────
    let totalExerciseDuration = 0, totalCaloriesBurned = 0;
    const exerciseTypeMap = {};
    exerciseLogs.forEach(e => {
      totalExerciseDuration += e.durationMinutes || 0;
      totalCaloriesBurned += e.caloriesBurned || 0;
      const type = e.exerciseType || 'OTHER';
      if (!exerciseTypeMap[type]) exerciseTypeMap[type] = { count: 0, duration: 0, burned: 0 };
      exerciseTypeMap[type].count += 1;
      exerciseTypeMap[type].duration += e.durationMinutes || 0;
      exerciseTypeMap[type].burned += e.caloriesBurned || 0;
    });

    // ── Weight progress ──────────────────────────────────────────────────────
    const startWeight = weightLogs.length > 0 ? weightLogs[0].weight : user.profile.weight;
    const endWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : user.profile.weight;
    const weightChange = endWeight - startWeight;
    const startBmi = weightLogs.length > 0 ? weightLogs[0].bmi : user.profile.bmi;
    const endBmi = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].bmi : user.profile.bmi;

    // ── Goals from user profile ──────────────────────────────────────────────
    const goalCalories = user.profile.dailyCalories || 2000;
    const goalProtein = user.profile.dailyProtein || 150;
    const goalCarbs = user.profile.dailyCarbs || 250;
    const goalFat = user.profile.dailyFat || 65;
    const waterGoal = user.profile.gender === 'MALE' ? 3000 : 2200;

    // ═════════════════════════════════════════════════════════════════════════
    // PDF GENERATION
    // ═════════════════════════════════════════════════════════════════════════

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true,
      info: {
        Title: `NutriTrack Pro — ${reportType} Nutrition Report`,
        Author: 'NutriTrack Pro',
        Subject: `${reportType} nutrition journey report for ${user.profile.name}`,
      }
    });

    const safeName = (user.profile.name || 'User').replace(/\s+/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=NutriTrack_${reportType}_Report_${safeName}.pdf`);
    doc.pipe(res);

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 1: COVER / HEADER
    // ═══════════════════════════════════════════════════════════════════════

    doc.moveDown(2);

    // Brand bar
    doc.rect(0, 0, doc.page.width, 6).fill(COLORS.primary);

    // Brand name
    doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.primary)
      .text('NutriTrack Pro', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor(COLORS.textLight)
      .text('AI-Powered Health & Nutrition Tracker', { align: 'center' });
    doc.moveDown(1.5);

    // Report title
    doc.fontSize(20).font('Helvetica-Bold').fillColor(COLORS.textDark)
      .text(`${reportType} Nutrition Report`, { align: 'center' });
    doc.moveDown(0.3);

    // Date range
    doc.fontSize(11).font('Helvetica').fillColor(COLORS.textMedium)
      .text(`${fmtDate(start)}  —  ${fmtDate(end)}`, { align: 'center' });
    doc.moveDown(0.5);

    // User info line
    doc.fontSize(10).font('Helvetica').fillColor(COLORS.textMedium)
      .text(`Prepared for: ${user.profile.name}  |  ${user.email}`, { align: 'center' });
    doc.fontSize(8).fillColor(COLORS.textLight)
      .text(`Generated on ${fmtDate(new Date())}`, { align: 'center' });

    drawSeparator(doc, COLORS.primary);

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 2: USER PROFILE SUMMARY
    // ═══════════════════════════════════════════════════════════════════════

    sectionHeader(doc, 'User Profile Summary', COLORS.secondary);

    const profile = user.profile;
    const profileLines = [
      [`Age: ${profile.age || 'N/A'}`, `Gender: ${profile.gender || 'N/A'}`, `Height: ${profile.height || 'N/A'} cm`],
      [`Current Weight: ${endWeight || 'N/A'} kg`, `Target Weight: ${profile.targetWeight || 'N/A'} kg`, `BMI: ${endBmi ? Number(endBmi).toFixed(1) : 'N/A'}`],
      [`Activity Level: ${(profile.activityLevel || 'N/A').replace(/_/g, ' ')}`, `Goal: ${(profile.goal || 'N/A').replace(/_/g, ' ')}`, `TDEE: ${profile.tdee ? Math.round(profile.tdee) : 'N/A'} kcal`],
    ];

    profileLines.forEach(line => {
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.textMedium)
        .text(line.join('   |   '), { align: 'left' });
    });

    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.textLight)
      .text(`Daily Goals  →  Calories: ${Math.round(goalCalories)} kcal  |  Protein: ${Math.round(goalProtein)}g  |  Carbs: ${Math.round(goalCarbs)}g  |  Fat: ${Math.round(goalFat)}g  |  Water: ${waterGoal} ml`);

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 3: OVERALL NUTRITION SUMMARY (STAT BOXES)
    // ═══════════════════════════════════════════════════════════════════════

    sectionHeader(doc, `Nutrition Overview — ${reportDays}-Day Averages`, COLORS.primary);

    const boxY = doc.y;
    const boxW = (doc.page.width - 100 - 40) / 5; // 5 boxes with 10px gap

    drawStatBox(doc, 50, boxY, boxW, 'Avg. Calories', String(avgCals), `kcal/day (goal: ${Math.round(goalCalories)})`, COLORS.primary);
    drawStatBox(doc, 50 + boxW + 10, boxY, boxW, 'Avg. Protein', String(avgProtein), `g/day (goal: ${Math.round(goalProtein)})`, COLORS.secondary);
    drawStatBox(doc, 50 + (boxW + 10) * 2, boxY, boxW, 'Avg. Carbs', String(avgCarbs), `g/day (goal: ${Math.round(goalCarbs)})`, COLORS.accent);
    drawStatBox(doc, 50 + (boxW + 10) * 3, boxY, boxW, 'Avg. Fat', String(avgFat), `g/day (goal: ${Math.round(goalFat)})`, COLORS.warning);
    drawStatBox(doc, 50 + (boxW + 10) * 4, boxY, boxW, 'Avg. Water', String(avgWater), `ml/day (goal: ${waterGoal})`, COLORS.secondary);

    doc.y = boxY + 65;

    // Totals row
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica').fillColor(COLORS.textMedium)
      .text(`Period Totals  →  ${Math.round(totalCals)} kcal consumed  |  ${totalMeals} meals logged  |  ${Math.round(totalWater / 1000)} L water  |  ${exerciseLogs.length} workouts  |  ${Math.round(totalCaloriesBurned)} kcal burned`);

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 4: DAILY BREAKDOWN TABLE
    // ═══════════════════════════════════════════════════════════════════════

    sectionHeader(doc, 'Daily Nutrition Breakdown', COLORS.primaryDark);

    const tableHeaders = ['Date', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Water (ml)', 'Meals'];
    const colWidths = [75, 70, 70, 70, 65, 70, 55];

    const tableRows = dailyEntries.map(([dateKey, d]) => [
      fmtShortDate(dateKey),
      Math.round(d.calories),
      Math.round(d.protein),
      Math.round(d.carbs),
      Math.round(d.fat),
      Math.round(d.water),
      d.mealCount
    ]);

    drawTable(doc, tableHeaders, tableRows, colWidths);

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 5: MEAL DISTRIBUTION
    // ═══════════════════════════════════════════════════════════════════════

    sectionHeader(doc, 'Meal Type Distribution', COLORS.accent);

    if (Object.keys(mealTypeMap).length === 0) {
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.textLight)
        .text('No meals logged during this period.');
    } else {
      const mealHeaders = ['Meal Type', 'Times Logged', 'Total Calories', 'Avg. Calories'];
      const mealColWidths = [130, 100, 120, 120];
      const mealRows = Object.entries(mealTypeMap).map(([type, data]) => [
        type.replace(/_/g, ' '),
        data.count,
        Math.round(data.calories),
        Math.round(data.calories / data.count)
      ]);
      drawTable(doc, mealHeaders, mealRows, mealColWidths);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 6: EXERCISE SUMMARY
    // ═══════════════════════════════════════════════════════════════════════

    sectionHeader(doc, 'Exercise Summary', COLORS.danger);

    if (exerciseLogs.length === 0) {
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.textLight)
        .text('No exercises logged during this period.');
    } else {
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.textMedium)
        .text(`Total Workouts: ${exerciseLogs.length}  |  Total Duration: ${totalExerciseDuration} min  |  Total Calories Burned: ${Math.round(totalCaloriesBurned)} kcal`);
      doc.moveDown(0.5);

      const exHeaders = ['Exercise Type', 'Sessions', 'Duration (min)', 'Calories Burned'];
      const exColWidths = [130, 100, 120, 120];
      const exRows = Object.entries(exerciseTypeMap).map(([type, data]) => [
        type.replace(/_/g, ' '),
        data.count,
        data.duration,
        Math.round(data.burned)
      ]);
      drawTable(doc, exHeaders, exRows, exColWidths);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 7: WEIGHT PROGRESS
    // ═══════════════════════════════════════════════════════════════════════

    sectionHeader(doc, 'Weight Progress', COLORS.secondary);

    if (weightLogs.length === 0) {
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.textLight)
        .text('No weight entries logged during this period. Showing profile data.');
      doc.moveDown(0.3);
    }

    checkPageBreak(doc, 70);
    const wpY = doc.y;
    const wpW = (doc.page.width - 100 - 30) / 4;

    drawStatBox(doc, 50, wpY, wpW, 'Start Weight', `${Number(startWeight || 0).toFixed(1)}`, 'kg', COLORS.textMedium);
    drawStatBox(doc, 50 + wpW + 10, wpY, wpW, 'End Weight', `${Number(endWeight || 0).toFixed(1)}`, 'kg', COLORS.textMedium);
    drawStatBox(doc, 50 + (wpW + 10) * 2, wpY, wpW, 'Net Change',
      `${weightChange > 0 ? '+' : ''}${Number(weightChange || 0).toFixed(1)}`,
      'kg',
      weightChange < 0 ? COLORS.success : weightChange > 0 ? COLORS.warning : COLORS.textLight
    );
    drawStatBox(doc, 50 + (wpW + 10) * 3, wpY, wpW, 'Current BMI', `${Number(endBmi || 0).toFixed(1)}`, '',
      endBmi < 18.5 ? COLORS.warning : endBmi < 25 ? COLORS.success : endBmi < 30 ? COLORS.accent : COLORS.danger
    );

    doc.y = wpY + 65;

    if (weightLogs.length > 1) {
      doc.moveDown(0.5);
      const wHeaders = ['Date', 'Weight (kg)', 'BMI'];
      const wColWidths = [160, 160, 160];
      const wRows = weightLogs.map(w => [
        fmtShortDate(w.date),
        Number(w.weight).toFixed(1),
        Number(w.bmi).toFixed(1)
      ]);
      drawTable(doc, wHeaders, wRows, wColWidths);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 8: INSIGHTS & RECOMMENDATIONS
    // ═══════════════════════════════════════════════════════════════════════

    sectionHeader(doc, 'Insights & Recommendations', COLORS.primary);

    const insights = [];

    // Calorie analysis
    const calPct = Math.round((avgCals / goalCalories) * 100);
    if (calPct < 80) {
      insights.push(`⚠ Your average calorie intake (${avgCals} kcal) is ${100 - calPct}% below your daily goal of ${Math.round(goalCalories)} kcal. Consider adding more nutrient-dense foods to your diet.`);
    } else if (calPct > 120) {
      insights.push(`⚠ Your average calorie intake (${avgCals} kcal) exceeds your daily goal by ${calPct - 100}%. Consider portion control or choosing lower-calorie alternatives.`);
    } else {
      insights.push(`✓ Great job! Your average calorie intake (${avgCals} kcal) is on track at ${calPct}% of your daily goal.`);
    }

    // Protein analysis
    const protPct = Math.round((avgProtein / goalProtein) * 100);
    if (protPct < 80) {
      insights.push(`⚠ Your protein intake (${avgProtein}g/day) is below target. Protein is essential for muscle maintenance and satiety.`);
    } else {
      insights.push(`✓ Your protein intake (${avgProtein}g/day) is solid at ${protPct}% of your goal.`);
    }

    // Water analysis
    const waterPct = Math.round((avgWater / waterGoal) * 100);
    if (avgWater > 0 && waterPct < 70) {
      insights.push(`⚠ Your water intake (${avgWater} ml/day) is only ${waterPct}% of the recommended ${waterGoal} ml. Stay hydrated!`);
    } else if (avgWater > 0) {
      insights.push(`✓ Good hydration! You averaged ${avgWater} ml/day (${waterPct}% of target).`);
    }

    // Exercise analysis
    if (exerciseLogs.length === 0) {
      insights.push(`⚠ No exercises logged this period. Regular physical activity helps you reach your health goals faster.`);
    } else {
      const avgExPerDay = (totalExerciseDuration / reportDays).toFixed(0);
      insights.push(`✓ You exercised ${exerciseLogs.length} times, burning ${Math.round(totalCaloriesBurned)} kcal total (~${avgExPerDay} min/day on average).`);
    }

    // Weight analysis
    if (weightLogs.length > 1) {
      const goalType = (profile.goal || '').toLowerCase();
      if (goalType.includes('lose') && weightChange < 0) {
        insights.push(`✓ You lost ${Math.abs(weightChange).toFixed(1)} kg — great progress toward your weight loss goal!`);
      } else if (goalType.includes('gain') && weightChange > 0) {
        insights.push(`✓ You gained ${weightChange.toFixed(1)} kg — making progress on muscle gain.`);
      } else if (goalType.includes('maintain') && Math.abs(weightChange) < 0.5) {
        insights.push(`✓ Your weight remained stable — excellent maintenance!`);
      } else if (weightChange !== 0) {
        insights.push(`ℹ Your weight changed by ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg this period. Review your goals if this isn't expected.`);
      }
    }

    // Meal consistency
    const loggedDays = dailyEntries.filter(([, d]) => d.mealCount > 0).length;
    const logPct = Math.round((loggedDays / reportDays) * 100);
    if (logPct < 50) {
      insights.push(`⚠ You only logged meals on ${loggedDays} of ${reportDays} days (${logPct}%). Consistent tracking leads to better results!`);
    } else if (logPct >= 80) {
      insights.push(`✓ Excellent consistency! You logged meals on ${loggedDays} of ${reportDays} days (${logPct}%).`);
    } else {
      insights.push(`ℹ You logged meals on ${loggedDays} of ${reportDays} days (${logPct}%). Try to log every day for the best insights.`);
    }

    insights.forEach((insight, i) => {
      checkPageBreak(doc, 30);
      const isPositive = insight.startsWith('✓');
      const isWarning = insight.startsWith('⚠');
      const color = isPositive ? COLORS.success : isWarning ? COLORS.accent : COLORS.textMedium;
      doc.fontSize(9.5).font('Helvetica').fillColor(color).text(insight, { indent: 5 });
      if (i < insights.length - 1) doc.moveDown(0.3);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════════════════════════════════════════

    drawSeparator(doc, COLORS.primary);
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.textLight)
      .text('This report was auto-generated by NutriTrack Pro. Data is based on your logged entries and may not reflect actual intake if meals were not logged.', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(7).fillColor(COLORS.textLight)
      .text('© NutriTrack Pro — Your AI-Powered Health Companion', { align: 'center' });

    // Bottom accent bar on last page
    const lastPage = doc.bufferedPageRange();
    doc.rect(0, doc.page.height - 6, doc.page.width, 6).fill(COLORS.primary);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Report generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating report: ' + error.message });
    }
  }
};
