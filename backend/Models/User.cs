namespace OnlineRegister.Models;

public class User
{
    // Database columns (match your Users table exactly)
    public int UserID { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string? Salt { get; set; }
    public string? Password { get; set; }
}