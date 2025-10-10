using Microsoft.EntityFrameworkCore;
using OnlineRegister.Models;

namespace OnlineRegister.Data;

/// <summary>
/// Custom identity structure replaced IdentityDbContext<User>(options) with  DbContext(options)
/// </summary>
/// <param name="options"></param>
public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{

    // Add DbSets for your existing tables
    public required DbSet<User> Users { get; set; }
    //public required DbSet<Registration> Registrations { get; set; }
    // Add more DbSets as needed for other existing tables
    // public DbSet<Event> Events { get; set; }
    // public DbSet<Category> Categories { get; set; }
    // public DbSet<Role> Roles { get; set; }
    // public DbSet<UserRole> UserRoles { get; set; }

    // The OnModelCreating method is essentially your "database schema translator" that makes your existing database work seamlessly with your C# models! 
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Without OnModelCreating: EF would assume
        // - Table name: "User" (not "Users")
        // - Column names exactly match property names
        // - Default data types and constraints
        // - May not work with your existing database!

        // With OnModelCreating: EF knows
        // - Look for "Users" table (your existing table)
        // - Map "FirstName" property to "FirstName" column
        // - Use decimal(18,2) for Fee column
        // - Apply your existing constraints and relationships



        // Database First: Map to existing tables
        // Configure User entity to map to your existing Users table
        builder.Entity<User>(entity =>
        {
            entity.ToTable("Users");

            // Primary key - maps to UserID column
            entity.HasKey(e => e.UserID);

            // Map database columns exactly as they exist in your Users table
            entity.Property(e => e.UserID)
                .HasColumnName("UserID")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Username)
                .HasColumnName("Username")
                .HasColumnType("varchar(50)")
                .IsRequired();

            entity.Property(e => e.Email)
                .HasColumnName("Email")
                .HasColumnType("varchar(100)")
                .IsRequired(false);

            entity.Property(e => e.Role)
                .HasColumnName("role")
                .HasColumnType("nvarchar(50)")
                .IsRequired(false);

            entity.Property(e => e.Salt)
                .HasColumnName("salt")
                .HasColumnType("varchar(256)")
                .IsRequired(false);

            entity.Property(e => e.Password)
                .HasColumnName("password")
                .HasColumnType("nvarchar(256)")
                .IsRequired(false);
        });



        // Map Identity tables only if they exist in your database
        // Uncomment these if you have existing Identity tables
        // builder.Entity<IdentityRole>().ToTable("AspNetRoles");
        // builder.Entity<IdentityUserRole<string>>().ToTable("AspNetUserRoles");
        // builder.Entity<IdentityUserClaim<string>>().ToTable("AspNetUserClaims");
        // builder.Entity<IdentityUserLogin<string>>().ToTable("AspNetUserLogins");
        // builder.Entity<IdentityUserToken<string>>().ToTable("AspNetUserTokens");
        // builder.Entity<IdentityRoleClaim<string>>().ToTable("AspNetRoleClaims");
    }
}