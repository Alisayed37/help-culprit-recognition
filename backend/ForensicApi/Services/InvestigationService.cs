using ForensicApi.Data;
using ForensicApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ForensicApi.Services;

public class InvestigationService : IInvestigationService
{
    private readonly ApplicationDbContext _context;

    public InvestigationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Investigation> CreateAsync(int userId, string title, string description)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Investigation title is required.");

        var investigation = new Investigation
        {
            Title = title,
            Description = description ?? string.Empty,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Investigations.Add(investigation);
        await _context.SaveChangesAsync();

        return investigation;
    }

    public async Task<List<Investigation>> GetByUserAsync(int userId)
    {
        return await _context.Investigations
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<Investigation?> GetByIdAsync(int id, int userId)
    {
        return await _context.Investigations
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var investigation = await _context.Investigations
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (investigation == null)
            throw new KeyNotFoundException($"Investigation {id} not found.");

        // Cascade delete removes uploaded images + embeddings from the DB
        _context.Investigations.Remove(investigation);
        await _context.SaveChangesAsync();
    }
}
