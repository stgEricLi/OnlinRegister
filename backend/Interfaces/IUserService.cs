using OnlineRegister.DTOs;

namespace OnlineRegister.Interfaces;

public interface IUserService
{
    Task<UserResponseDto?> RegisterAsync(RegisterDto registerDto);
    Task<string?> LoginAsync(LoginDto loginDto);
    Task<UserResponseDto?> GetUserByIdAsync(string userId);
    Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
    Task<bool> DeleteUserAsync(string userId);
}