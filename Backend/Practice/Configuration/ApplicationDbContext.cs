using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Practice.Models;

namespace Practice.Configuration
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Product> Products { get; set; }

        public DbSet<Blender> Blender{ get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
            Database.EnsureCreated();
        }

    }
}
