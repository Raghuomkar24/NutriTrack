import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Download, Calendar, Clock, TrendingUp,
  Utensils, Droplets, Dumbbell, Scale, BarChart3,
  ChevronRight, Sparkles, ArrowLeft, Loader2, CheckCircle2
} from 'lucide-react';

type ReportPeriod = 'weekly' | 'monthly';

interface ReportSection {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('weekly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const navigate = useNavigate();

  const days = selectedPeriod === 'weekly' ? 7 : 30;

  const reportSections: ReportSection[] = [
    {
      icon: <BarChart3 size={18} />,
      title: 'Nutrition Overview',
      description: 'Daily averages for calories, protein, carbs & fats vs. your personal goals',
      color: 'text-emerald-500',
    },
    {
      icon: <Utensils size={18} />,
      title: 'Daily Breakdown Table',
      description: 'Complete day-by-day nutrition and hydration data for the entire period',
      color: 'text-blue-500',
    },
    {
      icon: <TrendingUp size={18} />,
      title: 'Meal Distribution',
      description: 'Analysis by meal type — breakfast, lunch, dinner, and snack patterns',
      color: 'text-amber-500',
    },
    {
      icon: <Dumbbell size={18} />,
      title: 'Exercise Summary',
      description: 'Workout sessions, total duration, calories burned by exercise type',
      color: 'text-red-500',
    },
    {
      icon: <Scale size={18} />,
      title: 'Weight Progress',
      description: 'Start vs. end weight, net change, and BMI tracking over the period',
      color: 'text-indigo-500',
    },
    {
      icon: <Sparkles size={18} />,
      title: 'Insights & Recommendations',
      description: 'Auto-generated personalized tips based on your tracked data patterns',
      color: 'text-emerald-400',
    },
  ];

  const handleDownload = async () => {
    setIsGenerating(true);
    setGenerated(false);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8085';
      const url = `${apiUrl}/api/reports/download?days=${days}&token=${token}`;
      
      // Use fetch to download as blob so we can handle loading state
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `NutriTrack_${selectedPeriod === 'weekly' ? 'Weekly' : 'Monthly'}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      
      setGenerated(true);
      // Reset success state after a moment
      setTimeout(() => setGenerated(false), 4000);
    } catch (err) {
      console.error('Report download error:', err);
      alert('Failed to generate report. Please make sure the server is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate date range for display
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/analytics')}
            className="p-2 rounded-xl bg-white/50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-all duration-200 active:scale-95"
            aria-label="Back to Analytics"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Export Reports</h2>
            <p className="text-slate-500 text-sm mt-0.5">Generate comprehensive PDF summaries of your nutrition journey</p>
          </div>
        </div>
      </div>

      {/* Period Selector Card */}
      <div className="glass p-6 rounded-3xl border border-white/40 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-primary-600" />
          <h3 className="font-bold text-base text-slate-700">Select Report Period</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Weekly Option */}
          <button
            onClick={() => setSelectedPeriod('weekly')}
            className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
              selectedPeriod === 'weekly'
                ? 'border-primary-500 bg-primary-50/80 shadow-md shadow-primary-200/30'
                : 'border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-white/70'
            }`}
          >
            {selectedPeriod === 'weekly' && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 size={20} className="text-primary-600" />
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              selectedPeriod === 'weekly' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <Clock size={20} />
            </div>
            <h4 className="font-bold text-base text-slate-800">Weekly Report</h4>
            <p className="text-xs text-slate-500 mt-1">Last 7 days of your nutrition data</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {fmtDate(new Date(Date.now() - 6 * 86400000))} — {fmtDate(endDate)}
            </p>
          </button>

          {/* Monthly Option */}
          <button
            onClick={() => setSelectedPeriod('monthly')}
            className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
              selectedPeriod === 'monthly'
                ? 'border-primary-500 bg-primary-50/80 shadow-md shadow-primary-200/30'
                : 'border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-white/70'
            }`}
          >
            {selectedPeriod === 'monthly' && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 size={20} className="text-primary-600" />
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              selectedPeriod === 'monthly' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <Calendar size={20} />
            </div>
            <h4 className="font-bold text-base text-slate-800">Monthly Report</h4>
            <p className="text-xs text-slate-500 mt-1">Last 30 days of your nutrition data</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {fmtDate(new Date(Date.now() - 29 * 86400000))} — {fmtDate(endDate)}
            </p>
          </button>
        </div>
      </div>

      {/* Report Contents Preview */}
      <div className="glass p-6 rounded-3xl border border-white/40 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <FileText size={18} className="text-primary-600" />
          <h3 className="font-bold text-base text-slate-700">What's Included in Your Report</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportSections.map((section, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/60 border border-slate-100 hover:border-slate-200 hover:bg-white/80 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${section.color} transition-transform group-hover:scale-110`}>
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-700">{section.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{section.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Section */}
      <div className="glass p-8 rounded-3xl border border-white/40 shadow-sm text-center">
        <div className="max-w-md mx-auto">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${
            generated
              ? 'bg-green-100 text-green-600'
              : 'bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600'
          }`}>
            {generated ? <CheckCircle2 size={28} /> : <Download size={28} />}
          </div>

          <h3 className="font-bold text-lg text-slate-800 mb-1">
            {generated ? 'Report Downloaded!' : 'Ready to Export'}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {generated
              ? 'Your PDF report has been saved to your downloads folder.'
              : `Generate a detailed ${selectedPeriod === 'weekly' ? '7-day' : '30-day'} nutrition report as a professionally formatted PDF.`}
          </p>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
              generated
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200/40 hover:shadow-green-300/50'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-primary-200/40 hover:shadow-primary-300/50 hover:from-primary-600 hover:to-primary-700'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Generating Report...</span>
              </>
            ) : generated ? (
              <>
                <Download size={18} />
                <span>Download Again</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Download {selectedPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Report</span>
              </>
            )}
          </button>

          <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
            <FileText size={12} />
            PDF format • A4 size • Includes all tracked data
          </p>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="glass p-5 rounded-3xl border border-white/40 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-700 mb-1">Tips for Better Reports</h4>
            <ul className="text-xs text-slate-500 space-y-1 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <span>Log meals consistently every day for the most accurate nutrition insights.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <span>Track your water intake daily to see hydration trends in your report.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <span>Log your weight regularly to see progress trends and BMI changes.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <span>Record exercises to see how your calorie burn compares to your intake.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
