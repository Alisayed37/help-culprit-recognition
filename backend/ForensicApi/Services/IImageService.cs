using ForensicApi.Models;

namespace ForensicApi.Services;

public interface IImageService
{
    Task<UploadedImage> SaveImageAsync(int investigationId, IFormFile file);
    Task<List<UploadedImage>> GetImagesByInvestigationAsync(int investigationId);
    Task DeleteImageAsync(int imageId);
    Task<ImageEmbedding> SaveEmbeddingAsync(int uploadedImageId, string modelVersion, string vectorData);

    // Helper exposing the on-disk folder so controllers can hand it to Python for indexing
    string GetInvestigationImageFolder(int investigationId);
}
