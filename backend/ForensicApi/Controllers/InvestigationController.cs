using System.Security.Claims;
using ForensicApi.Models.DTOs;
using ForensicApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ForensicApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvestigationController : ControllerBase
{
    private readonly IInvestigationService _investigationService;

    public InvestigationController(IInvestigationService investigationService)
    {
        _investigationService = investigationService;
    }

    private int GetUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(idClaim) || !int.TryParse(idClaim, out var userId))
            throw new UnauthorizedAccessException("Invalid or missing user identity.");
        return userId;
    }

    // POST api/investigation/create
    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CreateInvestigationRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetUserId();
        var investigation = await _investigationService.CreateAsync(userId, request.Title, request.Description);

        return Ok(new
        {
            investigation.Id,
            investigation.Title,
            investigation.Description,
            investigation.CreatedAt
        });
    }

    // GET api/investigation/list
    [HttpGet("list")]
    public async Task<IActionResult> List()
    {
        var userId = GetUserId();
        var investigations = await _investigationService.GetByUserAsync(userId);

        var result = investigations.Select(i => new
        {
            i.Id,
            i.Title,
            i.Description,
            i.CreatedAt
        });

        return Ok(result);
    }

    // GET api/investigation/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var userId = GetUserId();
        var investigation = await _investigationService.GetByIdAsync(id, userId);

        if (investigation == null)
            throw new KeyNotFoundException($"Investigation {id} not found.");

        return Ok(new
        {
            investigation.Id,
            investigation.Title,
            investigation.Description,
            investigation.CreatedAt
        });
    }

    // DELETE api/investigation/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        await _investigationService.DeleteAsync(id, userId);
        return Ok(new { message = "Investigation deleted.", id });
    }
}
