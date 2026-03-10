using System;
using System.ComponentModel.DataAnnotations;

namespace LipaCityARTA.Models
{
    public class SurveyResponse
    {
        public int Id { get; set; }  

        [Required]
        public string Office { get; set; } = string.Empty;

        [Required]
        [Range(1, 120)]
        public int Age { get; set; }

        [Required]
        public string Sex { get; set; } = string.Empty;

        [Required]
        public string ClientType { get; set; } = string.Empty;

        [EmailAddress]
        public string? Email { get; set; }

        // Citizen Charter
        [Required(ErrorMessage = "Please select an answer for CC1")]
        public int? CC1 { get; set; }

        [Required(ErrorMessage = "Please select an answer for CC2")]
        public int? CC2 { get; set; }

        [Required(ErrorMessage = "Please select an answer for CC3")]
        public int? CC3 { get; set; }

        // Service Quality (SQD0–SQD8)
        [Required(ErrorMessage = "Please rate this question")]
        public int SQD0 { get; set; }
        public int SQD1 { get; set; }
        public int SQD2 { get; set; }
        public int SQD3 { get; set; }
        public int SQD4 { get; set; }
        public int SQD5 { get; set; }
        public int SQD6 { get; set; }
        public int SQD7 { get; set; }
        public int SQD8 { get; set; }

        public string? Suggestions { get; set; }

        public DateTime DateSubmitted { get; set; } = DateTime.Now;
    }
}