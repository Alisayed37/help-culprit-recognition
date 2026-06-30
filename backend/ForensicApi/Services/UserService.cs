using ForensicApi.Data;
using ForensicApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ForensicApi.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> AuthenticateAsync(string username, string password)
    {
        var user = await _context.Users.SingleOrDefaultAsync(x => x.Username == username);

        // check if user exists
        if (user == null)
            return null;

        // check if password is correct
        if (!VerifyPasswordHash(password, user.PasswordHash))
            return null;

        return user;
    }

    public async Task<User?> RegisterAsync(string username, string password)
    {
        if (await _context.Users.AnyAsync(x => x.Username == username))
            throw new Exception("Username \"" + username + "\" is already taken");

        string passwordHash = CreatePasswordHash(password);

        var user = new User
        {
            Username = username,
            PasswordHash = passwordHash
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    // Helper methods for hashing (BCrypt — salted + slow by design)
    private string CreatePasswordHash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private bool VerifyPasswordHash(string password, string storedHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, storedHash);
    }
}
