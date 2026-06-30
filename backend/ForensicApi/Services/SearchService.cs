using System.Text;
using System.Text.Json;
using ForensicApi.Models.DTOs;

namespace ForensicApi.Services;

public class SearchService : ISearchService
{
    private readonly HttpClient _httpClient;

    public SearchService(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
        // Point directly at the Python FastAPI server
        _httpClient.BaseAddress = new Uri("http://127.0.0.1:8000");
        _httpClient.Timeout = TimeSpan.FromMinutes(30);
    }

    public async Task<SearchResult> TextSearchAsync(int investigationId, string query, string model, string metric, int topK = 5)
    {
        var payload = new
        {
            investigationId,
            query,
            model,
            metric,
            topK
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("/api/search", content);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Python search failed ({(int)response.StatusCode}): {error}");
        }

        var json = await response.Content.ReadAsStringAsync();
        return ParseSearchResponse(investigationId, json);
    }

    public async Task<SearchResult> ImageSearchAsync(int investigationId, IFormFile queryImage, string model, string metric, int topK = 5)
    {
        if (queryImage == null || queryImage.Length == 0)
            throw new ArgumentException("No query image provided.");

        using var form = new MultipartFormDataContent();
        form.Add(new StringContent(investigationId.ToString()), "investigationId");
        form.Add(new StringContent(model), "model");
        form.Add(new StringContent(metric), "metric");
        form.Add(new StringContent(topK.ToString()), "topK");

        var fileContent = new StreamContent(queryImage.OpenReadStream());
        fileContent.Headers.ContentType =
            new System.Net.Http.Headers.MediaTypeHeaderValue(
                string.IsNullOrEmpty(queryImage.ContentType) ? "application/octet-stream" : queryImage.ContentType);
        form.Add(fileContent, "queryImage", queryImage.FileName);

        var response = await _httpClient.PostAsync("/api/search-by-image", form);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Python image search failed ({(int)response.StatusCode}): {error}");
        }

        var json = await response.Content.ReadAsStringAsync();
        return ParseSearchResponse(investigationId, json);
    }

    // Map Python's { investigationId, matches: [{ filename, match_score }] } into our DTO
    private static SearchResult ParseSearchResponse(int investigationId, string json)
    {
        var result = new SearchResult { InvestigationId = investigationId };

        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.TryGetProperty("matches", out var matches) &&
            matches.ValueKind == JsonValueKind.Array)
        {
            foreach (var match in matches.EnumerateArray())
            {
                var filename = match.TryGetProperty("filename", out var f) ? f.GetString() ?? "" : "";
                var score = match.TryGetProperty("match_score", out var s) ? s.GetDouble() : 0.0;

                result.Matches.Add(new MatchResult
                {
                    Filename = filename,
                    MatchScore = score,
                    MatchPercentage = Math.Round(Math.Max(0, score * 100), 1)
                });
            }
        }

        return result;
    }
}
