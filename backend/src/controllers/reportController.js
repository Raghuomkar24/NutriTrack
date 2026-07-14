const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Meal = require('../models/Meal');
const { WaterLog } = require('../models/Tracking');

exports.downloadReport = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { days } = req.query;
    const reportDays = parseInt(days) || 7;

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=NutriTrack_Report_${user.profile.name.replace(/\s+/g, '_')}.pdf`);
    
    doc.pipe(res);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#10b981').text('NutriTrack Pro', { align: 'center' });
    doc.fontSize(16).fillColor('#333333').text(`Health Report for ${user.profile.name}`, { align: 'center' });
    doc.moveDown();
    
    // User Details
    doc.fontSize(12).font('Helvetica').text(`Email: ${user.email}`);
    doc.text(`Age: ${user.profile.age} | Gender: ${user.profile.gender} | Weight: ${user.profile.weight}kg | Target: ${user.profile.targetWeight}kg`);
    doc.text(`Goal: ${user.profile.goal.replace('_', ' ')}`);
    doc.moveDown();

    // Summary text
    doc.text(`This report contains your nutrition and hydration summary for the last ${reportDays} days.`);
    doc.moveDown();

    // Fetch data for the last X days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - reportDays);

    const meals = await Meal.find({ user: req.user.id, date: { $gte: startDate } }).sort({ date: -1 });
    const waterLogs = await WaterLog.find({ user: req.user.id, date: { $gte: startDate } }).sort({ date: -1 });

    // Averages Calculation
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalWater = 0;
    
    meals.forEach(m => {
      totalCalories += m.totalCalories;
      totalProtein += m.totalProtein;
      totalCarbs += m.totalCarbs;
      totalFat += m.totalFat;
    });
    
    waterLogs.forEach(w => {
      totalWater += w.amount_ml;
    });

    const numMeals = meals.length > 0 ? reportDays : 1;
    const avgCalories = (totalCalories / numMeals).toFixed(0);
    const avgProtein = (totalProtein / numMeals).toFixed(0);
    const avgCarbs = (totalCarbs / numMeals).toFixed(0);
    const avgFat = (totalFat / numMeals).toFixed(0);
    const avgWater = (totalWater / numMeals).toFixed(0);

    // Write Averages
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#3b82f6').text(`Daily Averages (${reportDays} Days)`);
    doc.fontSize(12).font('Helvetica').fillColor('#333333');
    doc.text(`Calories: ${avgCalories} kcal / day`);
    doc.text(`Protein: ${avgProtein} g / day`);
    doc.text(`Carbohydrates: ${avgCarbs} g / day`);
    doc.text(`Fats: ${avgFat} g / day`);
    doc.text(`Water: ${avgWater} ml / day`);
    doc.moveDown(2);

    // Recent Logs
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#f59e0b').text(`Recent Meal Logs`);
    doc.fontSize(10).font('Helvetica').fillColor('#333333');
    
    if (meals.length === 0) {
      doc.text('No meals logged in this period.');
    } else {
      meals.slice(0, 10).forEach(m => {
        doc.text(`${new Date(m.date).toDateString()} - ${m.mealType}: ${Math.round(m.totalCalories)} kcal (P:${Math.round(m.totalProtein)} C:${Math.round(m.totalCarbs)} F:${Math.round(m.totalFat)})`);
      });
    }

    // Finalize PDF file
    doc.end();

  } catch (error) {
    res.status(500).send('Error generating report: ' + error.message);
  }
};
