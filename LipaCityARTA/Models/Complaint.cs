using System;
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

        public DateTime? ResolvedAt { get; set; }

        public int? AssignedToAdminUserId { get; set; }

        public string TrackingId { get; set; } = string.Empty;
    }
}