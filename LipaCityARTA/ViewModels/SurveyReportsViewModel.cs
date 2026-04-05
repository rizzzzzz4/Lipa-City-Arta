using System;
using System.Collections.Generic;
using LipaCityARTA.Models;

namespace LipaCityARTA.ViewModels
{
    public class SurveyReportsViewModel
    {
        public List<SurveyResponse> Surveys { get; set; } = new();

        public List<SurveyResponse> AllSurveys { get; set; } = new();

        public int CurrentPage { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public int TotalRecords { get; set; }

        public int TotalPages =>
            (int)Math.Ceiling((double)TotalRecords / PageSize);

        public string? Office { get; set; }
        public string? ClientType { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }
}