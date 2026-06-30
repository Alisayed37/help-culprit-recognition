using System.Text;
using System.Text.Json;
using ForensicApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ForensicApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ImageController : ControllerBase
{
    private readonly IImageService _imageService;
    private readonly HttpClient _httpClient;

    public ImageController(IImageService imageService, IHttpClientFactory httpClientFactory)
    {
        _imageService = imageService;

        // Used to trigger the Python indexing step after upload.
        // Indexing many images can take a long time on CPU, so allow a generous timeout.
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.BaseAddress = new Uri("http://127.0.0.1:8000");
        _httpClient.Timeout = TimeSpan.FromHours(3);
    }

    // POST api/image/upload
    // For bulk uploads the client sends images in batches with runIndex=false,
    // then calls the index endpoint once at the end.
    [HttpPost("upload")]
    [DisableRequestSizeLimit]
    [RequestFormLimits(ValueCountLimit = int.MaxValue, MultipartBodyLengthLimit = long.MaxValue)]
    public async Task<IActionResult> Upload(
        [FromForm] int investigationId,
        [FromForm] List<IFormFile> images,
        [FromForm] bool runIndex = true)
    {
        if (images == null || images.Count == 0)
            return BadRequest(new { message = "No images uploaded." });

        // 1. Save each file to disk + record in the database
        foreach (var file in images)
        {
            await _imageService.SaveImageAsync(investigationId, file);
        }

        // 2. Optionally (re)build the vector index now. For batched uploads the
        //    caller defers this and triggers indexing once after the last batch.
        if (runIndex)
        {
            var indexError = await TriggerIndexAsync(investigationId);
            if (indexError != null)
                return StatusCode(500, new { message = "Python indexing failed.", detail = indexError });
        }

        return Ok(new
        {
            message = $"Saved {images.Count} images." + (runIndex ? " Index rebuilt." : ""),
            investigationId
        });
    }

    // POST api/image/index/{investigationId} — (re)build the vector index for an investigation.
    [HttpPost("index/{investigationId}")]
    public async Task<IActionResult> Index(int investigationId)
    {
        var error = await TriggerIndexAsync(investigationId);
        if (error != null)
            return StatusCode(500, new { message = "Python indexing failed.", detail = error });

        return Ok(new { message = "Index rebuilt.", investigationId });
    }

    // Calls the Python service to rebuild vectors; returns null on success or an error string.
    private async Task<string?> TriggerIndexAsync(int investigationId)
    {
        var imageDirPath = _imageService.GetInvestigationImageFolder(investigationId);
        var payload = new { investigationId, imageDirPath };
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync("/api/index", content);
        if (response.IsSuccessStatusCode) return null;
        return await response.Content.ReadAsStringAsync();
    }

    // GET api/image/list/{investigationId}
    [HttpGet("list/{investigationId}")]
    public async Task<IActionResult> List(int investigationId)
    {
        var images = await _imageService.GetImagesByInvestigationAsync(investigationId);
        var result = images.Select(i => new
        {
            i.Id,
            i.FileName,
            i.InvestigationId,
            i.UploadedAt
        });
        return Ok(result);
    }

    // DELETE api/image/{imageId}
    [HttpDelete("{imageId}")]
    public async Task<IActionResult> Delete(int imageId)
    {
        await _imageService.DeleteImageAsync(imageId);
        return Ok(new { message = "Image deleted.", imageId });
    }
}
