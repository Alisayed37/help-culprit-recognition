using ForensicApi.Models;

namespace ForensicApi.Services;

public interface IUserService
{
    Task<User?> AuthenticateAsync(string username, string password);
    Task<User?> RegisterAsync(string username, string password);
    Task<User?> GetByIdAsync(int id);
}
