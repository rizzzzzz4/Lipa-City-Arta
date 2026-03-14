using System;
using System.Collections.Generic;

namespace LipaCityARTA.ViewModels
{
    public class AnalyticsDashboardViewModel
    {
        // Filters
        public string? Office { get; set; }
        public string Period { get; set; } = "month";
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public DateTime? SelectedDate { get; set; }

        // KPIs
        public int TotalSurveys { get; set; }
        public int TotalComplaints { get; set; }
        public double AvgSatisfaction { get; set; }

        // Trends
        public List<string> Labels { get; set; } = new();
        public List<double> SatisfactionTrend { get; set; } = new();
        public List<int> ComplaintTrend { get; set; } = new();

        // Office comparison
        public List<string> Offices { get; set; } = new();
        public List<double> OfficeSatisfaction { get; set; } = new();
        public List<int> OfficeComplaints { get; set; } = new();

        // Top/Bottom + Lowest
        public List<OfficeMetric> TopOffices { get; set; } = new();
        public List<OfficeMetric> BottomOffices { get; set; } = new();
        public List<QuestionMetric> LowestQuestions { get; set; } = new();

        public List<string> SQDLabels { get; set; } = new();
public List<double> SQDScores { get; set; } = new();
    }
    public class OfficeMetric
    {
        public string Office { get; set; } = "";
        public double Score { get; set; }
    }

    public class QuestionMetric
    {
        public string Question { get; set; } = "";
        public double Score { get; set; }
    }

}