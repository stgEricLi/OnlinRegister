using OnlineRegister.DTOs;

namespace OnlineRegister.Interfaces;

public interface IUserService
{
    Task<UserResponseDto?> RegisterAsync(RegisterDto registerDto);
    Task<AuthResult> LoginAsync(LoginDto loginDto);
    Task<UserResponseDto?> GetUserByIdAsync(string userId);
    Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
    Task<bool> DeleteUserAsync(string userId);
    Task<UserResponseDto?> UpdateUserAsync(string userId, UserResponseDto userData);
    Task<UserResponseDto?> CreateAdminUserAsync(RegisterDto registerDto);
}