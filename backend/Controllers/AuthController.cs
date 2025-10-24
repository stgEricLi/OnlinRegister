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
    ILogger<AuthController> logger,
    IWebHostEnvironment environment) : ControllerBase
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
            // The controller doesn't directly validate the Password and ConfirmPassword fields. 
            // Instead, it delegates this responsibility to a registerValidator (which is an IValidator<RegisterDto>) that gets injected into the controller.
            // The validation is handled by the RegisterDtoValidator class using FluentValidation (backend\Validators\RegisterDtoValidator.cs).
            // And it's registered at Program.cs 
            // builder.Services.AddScoped<IValidator<RegisterDto>, RegisterDtoValidator>();
            var validationResult = await registerValidator.ValidateAsync(registerDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
            }

            var user = await userService.RegisterAsync(registerDto);

            if (user != null)
            {
                logger.LogInformation("User registered successfully: {Email}", registerDto.Email);
                // UserResponseDto: {Id, Username, Email, Role}
                return Ok(new { success = true, Message = "User registered successfully", User = user });
            }

            return BadRequest(new { success = false, Message = "Registration failed" });
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
        // admin@stg.com, Stg123&%
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

    /// <summary>
    /// Create admin user (Development only - remove in production)
    /// </summary>
    /// <param name="registerDto">Admin user registration data</param>
    /// <returns>Admin user information if creation successful</returns>
    [HttpPost("create-admin")]
    public async Task<IActionResult> CreateAdmin([FromBody] RegisterDto registerDto)
    {
        try
        {
            // Only allow in development environment for security
            if (!environment.IsDevelopment())
            {
                return NotFound();
            }

            // Validate input
            var validationResult = await registerValidator.ValidateAsync(registerDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
            }

            var adminUser = await userService.CreateAdminUserAsync(registerDto);

            if (adminUser != null)
            {
                logger.LogInformation("Admin user created successfully: {Email}", registerDto.Email);
                return Ok(new { Message = "Admin user created successfully", User = adminUser });
            }

            return BadRequest(new { Message = "Admin user creation failed" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in CreateAdmin endpoint");
            return StatusCode(500, new { Message = "Internal server error" });
        }
    }
}