using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineRegister.Interfaces;

namespace OnlineRegister.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService userService, ILogger<UsersController> logger) : ControllerBase
{

    /// <summary>
    /// Get all users (Admin only)
    /// Check Policy at AuthorizationHandlerExtensions in the RoleAuthorizationHandler.cs
    /// </summary>
    /// <returns>List of all active users</returns>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var users = await userService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in GetAllUsers endpoint");
            return StatusCode(500, new { Message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    /// <returns>Current user information</returns>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Invalid token" });
            }

            var user = await userService.GetUserByIdAsync(userId);

            if (user != null)
            {
                return Ok(user);
            }

            return NotFound(new { Message = "User not found" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in GetCurrentUser endpoint");
            return StatusCode(500, new { Message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get user by ID (Users can access their own data, Managers/Admins can access any user data)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User information</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "UserOrHigher")]
    public async Task<IActionResult> GetUser(string id)
    {
        try
        {
            // Check if user is trying to access their own data or if they have elevated permissions
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Allow if user is accessing their own data, or if they are Manager/Admin
            if (currentUserId != id &&
                !string.Equals(userRole, "Manager", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                return Forbid("You can only access your own user data unless you have elevated permissions.");
            }

            var user = await userService.GetUserByIdAsync(id);

            if (user != null)
            {
                return Ok(user);
            }

            return NotFound(new { Message = "User not found" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in GetUser endpoint for ID: {UserId}", id);
            return StatusCode(500, new { Message = "Internal server error" });
        }
    }

    /// <summary>
    /// Delete user (Admin only)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>Success message</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        try
        {
            var result = await userService.DeleteUserAsync(id);

            if (result)
            {
                return Ok(new { Message = "User deleted successfully" });
            }

            return NotFound(new { Message = "User not found" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in DeleteUser endpoint for ID: {UserId}", id);
            return StatusCode(500, new { Message = "Internal server error" });
        }
    }

    /// <summary>
    /// Debug endpoint to test auth token and extract all claims
    /// </summary>
    /// <returns>All claims from the JWT token and auth info</returns>
    [HttpGet("debug/auth")]
    [Authorize]
    public IActionResult DebugAuth()
    {
        try
        {
            // Get the Authorization header
            var authHeader = Request.Headers.Authorization.FirstOrDefault();

            // Extract all claims from the current user
            var claims = User.Claims.Select(c => new
            {
                Type = c.Type,
                Value = c.Value,
                ValueType = c.ValueType,
                Issuer = c.Issuer
            }).ToList();

            // Get specific common claims
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var jti = User.FindFirst("jti")?.Value; // JWT ID
            var exp = User.FindFirst("exp")?.Value; // Expiration
            var iat = User.FindFirst("iat")?.Value; // Issued at

            var debugInfo = new
            {
                Message = "Auth token received successfully",
                AuthHeader = authHeader?.StartsWith("Bearer ") == true ?
                    $"Bearer {authHeader[7..10]}..." : authHeader, // Show only first 3 chars of token for security
                IsAuthenticated = User.Identity?.IsAuthenticated ?? false,
                AuthenticationType = User.Identity?.AuthenticationType,
                TotalClaims = claims.Count,
                CommonClaims = new
                {
                    UserId = userId,
                    UserName = userName,
                    Email = userEmail,
                    Role = userRole,
                    JwtId = jti,
                    ExpiresAt = exp,
                    IssuedAt = iat
                },
                AllClaims = claims,
                RequestInfo = new
                {
                    Method = Request.Method,
                    Path = Request.Path,
                    QueryString = Request.QueryString.ToString(),
                    UserAgent = Request.Headers.UserAgent.FirstOrDefault(),
                    RemoteIpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
                }
            };

            logger.LogInformation("Debug auth endpoint called by user {UserId} with {ClaimCount} claims",
                userId, claims.Count);

            return Ok(debugInfo);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in DebugAuth endpoint");
            return StatusCode(500, new { Message = "Internal server error", Error = ex.Message });
        }
    }
}