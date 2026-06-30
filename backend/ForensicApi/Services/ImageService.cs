using ForensicApi.Data;
using ForensicApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ForensicApi.Services;

public class ImageService : IImageService
{
    private readonly ApplicationDbContext _context;
    private readonly string _basePath;

    public ImageService(ApplicationDbContext context)
    {
        _context = context;
        // Same location used by the static file provider in Program.cs
        _basePath = Path.Combine(Directory.GetCurrentDirectory(), "InvestigationData");
    }

    public string GetInvestigationImageFolder(int investigationId)
    {
        return Path.Combine(_basePath, investigationId.ToString(), "images");
    }

    public async Task<UploadedImage> SaveImageAsync(int investigationId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Empty file uploaded.");

        // 1. Save the raw bytes to ./InvestigationData/{id}/images/{filename}
        var folder = GetInvestigationImageFolder(investigationId);
        Directory.CreateDirectory(folder);

        var filePath = Path.Combine(folder, file.FileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // 2. Record it in the database (avoid duplicate rows for the same file)
        var existing = await _context.UploadedImages
            .FirstOrDefaultAsync(i => i.InvestigationId == investigationId && i.FileName == file.FileName);

        if (existing != null)
        {
            existing.FilePath = filePath;
            existing.UploadedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return existing;
        }

        var image = new UploadedImage
        {
            FileName = file.FileName,
            FilePath = filePath,
            InvestigationId = investigationId,
            UploadedAt = DateTime.UtcNow
        };

        _context.UploadedImages.Add(image);
        await _context.SaveChangesAsync();

        return image;
    }

    public async Task<List<UploadedImage>> GetImagesByInvestigationAsync(int investigationId)
    {
        return await _context.UploadedImages
            .Where(i => i.InvestigationId == investigationId)
            .OrderBy(i => i.FileName)
            .ToListAsync();
    }

    public async Task DeleteImageAsync(int imageId)
    {
        var image = await _context.UploadedImages.FindAsync(imageId);
        if (image == null)
            throw new KeyNotFoundException($"Image {imageId} not found.");

        // Remove from disk if it still exists
        if (!string.IsNullOrEmpty(image.FilePath) && File.Exists(image.FilePath))
        {
            File.Delete(image.FilePath);
        }

        // Cascade delete will clean up embeddings
        _context.UploadedImages.Remove(image);
        await _context.SaveChangesAsync();
    }

    public async Task<ImageEmbedding> SaveEmbeddingAsync(int uploadedImageId, string modelVersion, string vectorData)
    {
        var embedding = new ImageEmbedding
        {
            UploadedImageId = uploadedImageId,
            ModelVersion = modelVersion,
            VectorData = vectorData
        };

        _context.ImageEmbeddings.Add(embedding);
        await _context.SaveChangesAsync();

        return embedding;
    }
}
