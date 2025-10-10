using Microsoft.AspNetCore.Mvc;
using OnlineRegister.DTOs;
using OnlineRegister.Interfaces;
using FluentValidation;

namespace OnlineRegister.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IUserService userService,
    IValidator<RegisterDto> registerValidator,
    IValidator<LoginDto> loginValidator,
    ILogger<AuthController> logger) : ControllerBase
{

    /// <summary>
    /// Register a new user
    /// </summary>
    /// <param name="registerDto">User registration data</param>
    /// <returns>User information if registration successful</returns>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            // Validate input
            var validationResult = await registerValidator.ValidateAsync(registerDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
            }

            var user = await userService.RegisterAsync(registerDto);

            if (user != null)
            {
                logger.LogInformation("User registered successfully: {Email}", registerDto.Email);
                return Ok(new { Message = "User registered successfully", User = user });
            }

            return BadRequest(new { Message = "Registration failed" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in Register endpoint");
            return StatusCode(500, new { Message = "Internal server error" });
        }
    }

    /// <summary>
    /// Login user
    /// </summary>
    /// <param name="loginDto">User login credentials</param>
    /// <returns>JWT token if login successful</returns>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            // Validate input
            var validationResult = await loginValidator.ValidateAsync(loginDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
            }

            var result = await userService.LoginAsync(loginDto);

            if (result.Success)
            {
                return Ok(result);
            }

            return Unauthorized(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in Login endpoint");
            return StatusCode(500, new AuthResult
            {
                Success = false,
                Message = "An error occurred during login"
            });
        }
    }
}