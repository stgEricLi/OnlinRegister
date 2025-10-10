using Microsoft.EntityFrameworkCore;
using OnlineRegister.Data;
using OnlineRegister.DTOs;
using OnlineRegister.Interfaces;
using OnlineRegister.Models;
using OnlineRegister.Helpers;
using AutoMapper;
using System.Security.Cryptography;
using System.Text;

namespace OnlineRegister.Services;

public class UserService(
    ApplicationDbContext context,
    IMapper mapper, // ← AutoMapper injected here
    ILogger<UserService> logger, // ILogger is .NET's built-in logging interface 
    JwtHelper jwtHelper) : IUserService
{

    public async Task<UserResponseDto?> RegisterAsync(RegisterDto registerDto)
    {
        try
        {
            // Check if user already exists
            var existingUser = await context.Users
                .FirstOrDefaultAsync(u => u.Email == registerDto.Email);

            if (existingUser != null)
            {
                logger.LogWarning("User registration failed - email already exists: {Email}", registerDto.Email);
                return null;
            }

            // Create user manually since we need to handle salt and password
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Role = "User", // Default role
                Salt = GenerateSalt()
            };

            // Hash password with the generated salt
            user.Password = HashPasswordWithSalt(registerDto.Password, user.Salt);

            context.Users.Add(user);
            await context.SaveChangesAsync();

            logger.LogInformation("User {Email} registered successfully", registerDto.Email);

            // IMapper is part of the AutoMapper library that automatically maps properties between different object types. 
            // Mapping config is at AutoMapperProfile.cs
            // It's incredibly useful for converting between:
            // - DTOs (Data Transfer Objects) ↔ Models (Database Entities) 
            // - API Requests ↔ Domain Objects
            // - Database Models ↔ Response Objects
            return mapper.Map<UserResponseDto>(user);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred during user registration for {Email}", registerDto.Email);
            return null;
        }
    }

    public async Task<string?> LoginAsync(LoginDto loginDto)
    {
        try
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                logger.LogWarning("Login attempt with non-existent email: {Email}", loginDto.Email);
                return null;
            }



            if (VerifyPasswordWithSalt(loginDto.Password, user.Password, user.Salt))
            {

                logger.LogInformation("User {Email} logged in successfully", loginDto.Email);
                var token = jwtHelper.GenerateToken(user);
                return token;
            }
            else
            {
                logger.LogWarning("Failed login attempt for {Email}", loginDto.Email);
                return null;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred during login for {Email}", loginDto.Email);
            return null;
        }
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(string userId)
    {
        try
        {
            if (!int.TryParse(userId, out int id))
            {
                return null;
            }

            var user = await context.Users
                .FirstOrDefaultAsync(u => u.UserID == id);

            return user != null ? mapper.Map<UserResponseDto>(user) : null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting user {UserId}", userId);
            return null;
        }
    }

    public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
    {
        try
        {
            var users = await context.Users.ToListAsync();
            return mapper.Map<IEnumerable<UserResponseDto>>(users);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all users");
            return Enumerable.Empty<UserResponseDto>();
        }
    }

    public async Task<bool> DeleteUserAsync(string userId)
    {
        try
        {
            if (!int.TryParse(userId, out int id))
            {
                return false;
            }

            var user = await context.Users
                .FirstOrDefaultAsync(u => u.UserID == id);
            if (user == null) return false;

            // Hard delete (or you could add an IsActive column to your database)
            context.Users.Remove(user);

            await context.SaveChangesAsync();

            logger.LogInformation("User {UserId} deleted successfully", userId);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while deleting user {UserId}", userId);
            return false;
        }
    }

    // Password hashing methods using salt (matches your database structure)
    private static string GenerateSalt()
    {
        var saltBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(saltBytes);
        return Convert.ToBase64String(saltBytes);
    }

    private static string HashPasswordWithSalt(string password, string? salt)
    {
        if (string.IsNullOrEmpty(salt)) return string.Empty;

        var hashedBytes = SHA256.HashData(Encoding.UTF8.GetBytes(password + salt));
        return Convert.ToBase64String(hashedBytes);
    }

    private static bool VerifyPasswordWithSalt(string password, string? hash, string? salt)
    {
        if (string.IsNullOrEmpty(hash) || string.IsNullOrEmpty(salt)) return false;

        var hashedPassword = HashPasswordWithSalt(password, salt);
        return hashedPassword == hash;
    }
}