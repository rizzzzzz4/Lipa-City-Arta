using System;
using System.Collections.Generic;
using LipaCityARTA.Models;

namespace LipaCityARTA.ViewModels
{
    public class ComplaintListViewModel
    {
        public List<Complaint> Complaints { get; set; } = new();

        public string? Office { get; set; }
        public string? Status { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public string? Search { get; set; }

        public int Total { get; set; }
        public int Pending { get; set; }
        public int InProgress { get; set; }
        public int Resolved { get; set; }
        public int Escalated { get; set; }

        // Dashboard stats
        public int OpenCount { get; set; }
        public int OverdueCount { get; set; }
        public int UnassignedCount { get; set; }

        public int NewComplaints { get; set; }
        public int ResolvedCount { get; set; }
        public int BacklogAvg { get; set; }


        public Dictionary<string, int> ByOffice { get; set; } = new();
        public Dictionary<string, int> ByReason { get; set; } = new();
        public Dictionary<string, int> ByDate { get; set; } = new();
    }
}