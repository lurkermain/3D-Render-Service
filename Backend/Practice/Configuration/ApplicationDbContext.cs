using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Practice.Enums;
using Practice.Models;

namespace Practice.Configuration
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Product> Products { get; set; }
        public DbSet<Render> Render { get; set; }

        public DbSet<Blender> Blender{ get; set; }
        public DbSet<ModelTypes> ModelTypes { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>()
                .HasOne(p => p.ModelType)
                .WithMany(mt => mt.Products)
                .HasForeignKey(p => p.ModelTypeId);
        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder
                .EnableSensitiveDataLogging()
                .LogTo(Console.WriteLine, LogLevel.Information);
        }
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {

            Database.EnsureCreated();
        }

    }
}
/*Database.EnsureDeleted();*/