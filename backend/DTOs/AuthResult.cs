using OnlineRegister.Models;

namespace OnlineRegister.DTOs;

public class AuthResult
{
    public bool Success { get; set; }
    public string Token { get; set; } = string.Empty;
    public User? User { get; set; }
    public string Message { get; set; } = string.Empty;
}