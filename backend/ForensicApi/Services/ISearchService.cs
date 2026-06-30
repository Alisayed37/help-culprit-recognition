using ForensicApi.Models.DTOs;

namespace ForensicApi.Services;

public interface ISearchService
{
    Task<SearchResult> TextSearchAsync(int investigationId, string query, string model, string metric, int topK = 5);
    Task<SearchResult> ImageSearchAsync(int investigationId, IFormFile queryImage, string model, string metric, int topK = 5);
}
