using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LipaCityARTA.Models
{
    public class Complaint
    {
        public int Id { get; set; }

        [Required]
        public string Office { get; set; } = string.Empty;

        [Required]
        public string ClientType { get; set; } = string.Empty;

        [Required]
        public string Reason { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending";

        public DateTime DateSubmitted { get; set; } = DateTime.Now;

        public string TrackingId { get; set; } = string.Empty;

        // Optional legacy/latest note field
        public string? AdminActionNote { get; set; }

        public bool IsCaseClosed { get; set; } = false;
        public DateTime? ResolvedAt { get; set; }

        public List<ComplaintActionHistory> ActionHistories { get; set; } = new();
    }
}