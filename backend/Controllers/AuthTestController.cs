using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineRegister.Models;
using System.Security.Claims;

namespace OnlineRegister.Controllers;

/// <summary>
/// Test controller to demonstrate the custom authorization system
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthTestController : ControllerBase
{
    private readonly ILogger<AuthTestController> _logger;

    public AuthTestController(ILogger<AuthTestController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Public endpoint - no authentication required
    /// </summary>
    [HttpGet("public")]
    public IActionResult GetPublicData()
    {
        return Ok(new
        {
            Message = "This is public data - no authentication required",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// User or higher - any authenticated user can access
    /// </summary>
    [HttpGet("user-or-higher")]
    [Authorize(Policy = "UserOrHigher")]
    public IActionResult GetUserData()
    {
        var username = User.Identity?.Name ?? "Unknown";
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Unknown";

        return Ok(new
        {
            Message = $"Hello {username} ({role}), this requires User role or higher",
            Timestamp = DateTime.UtcNow,
            UserRole = role
        });
    }

    /// <summary>
    /// Manager or higher - requires Manager or Admin role
    /// </summary>
    [HttpGet("manager-or-higher")]
    [Authorize(Policy = "ManagerOrHigher")]
    public IActionResult GetManagerData()
    {
        var username = User.Identity?.Name ?? "Unknown";
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Unknown";

        return Ok(new
        {
            Message = $"Hello {username} ({role}), this requires Manager role or higher",
            Timestamp = DateTime.UtcNow,
            UserRole = role
        });
    }

    /// <summary>
    /// Admin only - requires exactly Admin role
    /// </summary>
    [HttpGet("admin-only")]
    [Authorize(Policy = "AdminOnly")]
    public IActionResult GetAdminData()
    {
        var username = User.Identity?.Name ?? "Unknown";
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Unknown";

        return Ok(new
        {
            Message = $"Hello Admin {username}, this requires Admin role only",
            Timestamp = DateTime.UtcNow,
            UserRole = role
        });
    }

    /// <summary>
    /// Manager scope - demonstrates manager-specific operations
    /// </summary>
    [HttpGet("manager-scope")]
    [Authorize(Policy = "ManagerScope")]
    public IActionResult GetManagerScopeData()
    {
        var username = User.Identity?.Name ?? "Unknown";
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Unknown";

        return Ok(new
        {
            Message = $"Hello {username} ({role}), this is manager scope data",
            Timestamp = DateTime.UtcNow,
            UserRole = role
        });
    }

    /// <summary>
    /// Shows current user's claims and authorization info
    /// </summary>
    [HttpGet("user-info")]
    [Authorize]
    public IActionResult GetUserInfo()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        return Ok(new
        {
            UserId = userId,
            Username = username,
            Email = email,
            Role = role,
            IsAuthenticated = User.Identity?.IsAuthenticated,
            AuthenticationType = User.Identity?.AuthenticationType,
            AllClaims = claims
        });
    }

    /// <summary>
    /// Test endpoint for role hierarchy
    /// </summary>
    [HttpGet("role-hierarchy-test")]
    [Authorize]
    public IActionResult TestRoleHierarchy()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (Enum.TryParse<UserRole>(role, out var userRole))
        {
            var canAccessUserLevel = (int)userRole >= (int)UserRole.User;
            var canAccessManagerLevel = (int)userRole >= (int)UserRole.Manager;
            var canAccessAdminLevel = (int)userRole >= (int)UserRole.Admin;

            return Ok(new
            {
                CurrentRole = role,
                RoleValue = (int)userRole,
                Permissions = new
                {
                    CanAccessUserLevel = canAccessUserLevel,
                    CanAccessManagerLevel = canAccessManagerLevel,
                    CanAccessAdminLevel = canAccessAdminLevel
                }
            });
        }

        return BadRequest(new { Message = "Invalid role in token" });
    }
}