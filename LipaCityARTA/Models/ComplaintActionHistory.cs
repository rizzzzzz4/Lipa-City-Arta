using System;

namespace LipaCityARTA.Models
{
    public class ComplaintActionHistory
    {
        public int Id { get; set; }

        public int ComplaintId { get; set; }
        public Complaint? Complaint { get; set; }

        public string ActionNote { get; set; } = string.Empty;
        public string StatusAtThatTime { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}