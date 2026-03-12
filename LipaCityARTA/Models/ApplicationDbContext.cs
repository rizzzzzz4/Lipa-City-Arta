using LipaCityARTA.Model;
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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Make TrackingId unique
            modelBuilder.Entity<Complaint>()
                .HasIndex(c => c.TrackingId)
                .IsUnique();

            // Seed a default admin user
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