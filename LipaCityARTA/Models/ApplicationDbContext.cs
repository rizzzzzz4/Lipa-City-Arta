using LipaCityARTA.Models;
using Microsoft.EntityFrameworkCore;

namespace LipaCityARTA.Models
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<AdminUser> AdminUsers { get; set; }
        public DbSet<SurveyResponse> SurveyResponses { get; set; }
        public DbSet<Complaint> Complaints { get; set; }
        public DbSet<ComplaintActionHistory> ComplaintActionHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Complaint>()
                .HasIndex(c => c.TrackingId)
                .IsUnique();

            modelBuilder.Entity<ComplaintActionHistory>()
                .HasOne(h => h.Complaint)
                .WithMany(c => c.ActionHistories)
                .HasForeignKey(h => h.ComplaintId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdminUser>().HasData(
                new AdminUser
                {
                    Id = 1,
                    Username = "admin",
                    Email = "admin@lipacityarta.local",
                    Password = "admin123"
                }
            );
        }
    }
}