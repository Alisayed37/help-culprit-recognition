using ForensicApi.Models;

namespace ForensicApi.Services;

public interface IInvestigationService
{
    Task<Investigation> CreateAsync(int userId, string title, string description);
    Task<List<Investigation>> GetByUserAsync(int userId);
    Task<Investigation?> GetByIdAsync(int id, int userId);
    Task DeleteAsync(int id, int userId);
}
