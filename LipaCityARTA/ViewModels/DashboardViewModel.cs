using LipaCityARTA.Models;
using System;
using System.Collections.Generic;

namespace LipaCityARTA.ViewModels
{
    public class DashboardViewModel
    {
        public int TotalComplaints { get; set; }
        public int TotalSurveys { get; set; }

        // ✅ NEW
        public int TotalSubmissions { get; set; }
        public int ActiveUsers { get; set; }
        public int PendingComplaints { get; set; }

        public List<OfficeCount> OfficeBreakdown { get; set; } = new();
        public string MostVisitedOffice { get; set; } = string.Empty;

        public double[] AvgSQDs { get; set; } = new double[9];

        // ✅ NEW (Trend Chart)
        public List<string> TrendDates { get; set; } = new();
        public List<int> TrendCounts { get; set; } = new();

        // ✅ NEW (Notifications)
        public List<Complaint> RecentComplaints { get; set; } = new();
    }
}