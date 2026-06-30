using Microsoft.EntityFrameworkCore;
using ForensicApi.Models;

namespace ForensicApi.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Investigation> Investigations => Set<Investigation>();
    public DbSet<UploadedImage> UploadedImages => Set<UploadedImage>();
    public DbSet<ImageEmbedding> ImageEmbeddings => Set<ImageEmbedding>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique username
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        // --- Indexes ---
        modelBuilder.Entity<Investigation>()
            .HasIndex(i => i.UserId);

        modelBuilder.Entity<ImageEmbedding>()
            .HasIndex(e => e.ModelVersion);

        // --- Cascade delete rules ---
        // Deleting a user removes their investigations
        modelBuilder.Entity<Investigation>()
            .HasOne(i => i.User)
            .WithMany(u => u.Investigations)
            .HasForeignKey(i => i.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Deleting an investigation removes its uploaded images
        modelBuilder.Entity<UploadedImage>()
            .HasOne(img => img.Investigation)
            .WithMany(i => i.UploadedImages)
            .HasForeignKey(img => img.InvestigationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Deleting an uploaded image removes its embeddings
        modelBuilder.Entity<ImageEmbedding>()
            .HasOne(e => e.UploadedImage)
            .WithMany(img => img.Embeddings)
            .HasForeignKey(e => e.UploadedImageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
