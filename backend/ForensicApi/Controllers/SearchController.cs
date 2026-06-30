using ForensicApi.Models.DTOs;
using ForensicApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ForensicApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    // POST api/search/text
    [HttpPost("text")]
    public async Task<IActionResult> TextSearch([FromBody] TextSearchRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _searchService.TextSearchAsync(
            request.InvestigationId, request.Query, request.Model, request.Metric, request.TopK);

        return Ok(result);
    }

    // POST api/search/image
    [HttpPost("image")]
    public async Task<IActionResult> ImageSearch([FromForm] ImageSearchRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _searchService.ImageSearchAsync(
            request.InvestigationId, request.QueryImage, request.Model, request.Metric, request.TopK);

        return Ok(result);
    }
}
