using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineRegister.Models;
using System.Security.Claims;

namespace OnlineRegister.Controllers;

/// <summary>
/// Example controller demonstrating ResourceOwner authorization in action
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ResourceOwnerExampleController : ControllerBase
{
    private readonly ILogger<ResourceOwnerExampleController> _logger;
    private readonly IAuthorizationService _authorizationService;

    // Mock data for demonstration
    private static readonly List<UserProfile> _profiles = new()
    {
        new() { Id = 1, UserId = "1", FirstName = "John", LastName = "Doe", Bio = "Software Developer" },
        new() { Id = 2, UserId = "2", FirstName = "Jane", LastName = "Smith", Bio = "Product Manager" },
        new() { Id = 3, UserId = "3", FirstName = "Admin", LastName = "User", Bio = "System Administrator" }
    };

    private static readonly List<UserDocument> _documents = new()
    {
        new() { DocumentId = 1, OwnerId = "1", Title = "My Resume", Content = "John's resume content", IsPrivate = true },
        new() { DocumentId = 2, OwnerId = "2", Title = "Project Plan", Content = "Jane's project plan", IsPrivate = false },
        new() { DocumentId = 3, OwnerId = "1", Title = "Personal Notes", Content = "John's private notes", IsPrivate = true }
    };

    private static readonly List<UserPost> _posts = new()
    {
        new() { PostId = 1, UserId = "1", Title = "Hello World", Content = "My first post", IsPublished = true },
        new() { PostId = 2, UserId = "2", Title = "Product Update", Content = "New features coming", IsPublished = true },
        new() { PostId = 3, UserId = "1", Title = "Draft Post", Content = "Work in progress", IsPublished = false }
    };

    public ResourceOwnerExampleController(
        ILogger<ResourceOwnerExampleController> logger,
        IAuthorizationService authorizationService)
    {
        _logger = logger;
        _authorizationService = authorizationService;
    }

    /// <summary>
    /// Get user profile - users can only see their own profile, admins can see any
    /// </summary>
    [HttpGet("profiles/{userId}")]
    [Authorize(Policy = "ResourceOwner")]
    public async Task<IActionResult> GetUserProfile(string userId)
    {
        var profile = _profiles.FirstOrDefault(p => p.UserId == userId);
        if (profile == null)
        {
            return NotFound(new { Message = "Profile not found" });
        }

        // The ResourceOwner policy automatically checks if:
        // 1. Current user ID matches the userId parameter (resource ownership)
        // 2. OR current user is Admin (can access any resource)

        // Additional manual authorization check (alternative approach)
        var authResult = await _authorizationService.AuthorizeAsync(User, userId, "ResourceOwner");
        if (!authResult.Succeeded)
        {
            return Forbid("You can only access your own profile unless you're an admin.");
        }

        return Ok(profile);
    }

    /// <summary>
    /// Get user document - demonstrates resource ownership with OwnerId property
    /// </summary>
    [HttpGet("documents/{documentId}")]
    [Authorize(Policy = "ResourceOwner")]
    public async Task<IActionResult> GetDocument(int documentId)
    {
        var document = _documents.FirstOrDefault(d => d.DocumentId == documentId);
        if (document == null)
        {
            return NotFound(new { Message = "Document not found" });
        }

        // Manual authorization check passing the document object as resource
        var authResult = await _authorizationService.AuthorizeAsync(User, document, "ResourceOwner");
        if (!authResult.Succeeded)
        {
            return Forbid("You can only access your own documents unless you're an admin.");
        }

        return Ok(document);
    }

    /// <summary>
    /// Update user profile - only owner or admin can update
    /// </summary>
    [HttpPut("profiles/{userId}")]
    [Authorize(Policy = "ResourceOwner")]
    public async Task<IActionResult> UpdateProfile(string userId, [FromBody] UserProfile updatedProfile)
    {
        var existingProfile = _profiles.FirstOrDefault(p => p.UserId == userId);
        if (existingProfile == null)
        {
            return NotFound(new { Message = "Profile not found" });
        }

        // Check authorization with the existing profile as resource
        var authResult = await _authorizationService.AuthorizeAsync(User, existingProfile, "ResourceOwner");
        if (!authResult.Succeeded)
        {
            return Forbid("You can only update your own profile unless you're an admin.");
        }

        // Update profile
        existingProfile.FirstName = updatedProfile.FirstName;
        existingProfile.LastName = updatedProfile.LastName;
        existingProfile.Bio = updatedProfile.Bio;
        existingProfile.UpdatedAt = DateTime.UtcNow;

        return Ok(existingProfile);
    }

    /// <summary>
    /// Delete user document - only owner or admin can delete
    /// </summary>
    [HttpDelete("documents/{documentId}")]
    [Authorize(Policy = "ResourceOwner")]
    public async Task<IActionResult> DeleteDocument(int documentId)
    {
        var document = _documents.FirstOrDefault(d => d.DocumentId == documentId);
        if (document == null)
        {
            return NotFound(new { Message = "Document not found" });
        }

        // Check authorization
        var authResult = await _authorizationService.AuthorizeAsync(User, document, "ResourceOwner");
        if (!authResult.Succeeded)
        {
            return Forbid("You can only delete your own documents unless you're an admin.");
        }

        _documents.Remove(document);
        return Ok(new { Message = "Document deleted successfully" });
    }

    /// <summary>
    /// Get user posts - demonstrates different approaches to resource ownership
    /// </summary>
    [HttpGet("posts/user/{userId}")]
    [Authorize(Policy = "UserOrHigher")]
    public async Task<IActionResult> GetUserPosts(string userId)
    {
        // Manual ownership check in controller
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        // Allow if accessing own posts or if admin
        if (currentUserId != userId && !string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            return Forbid("You can only access your own posts unless you're an admin.");
        }

        var posts = _posts.Where(p => p.UserId == userId).ToList();
        return Ok(posts);
    }

    /// <summary>
    /// Demonstrates complex resource ownership scenarios
    /// </summary>
    [HttpGet("complex-example/{resourceType}/{resourceId}")]
    [Authorize(Policy = "ResourceOwner")]
    public async Task<IActionResult> ComplexResourceExample(string resourceType, string resourceId)
    {
        object? resource = resourceType.ToLower() switch
        {
            "profile" => _profiles.FirstOrDefault(p => p.Id.ToString() == resourceId),
            "document" => _documents.FirstOrDefault(d => d.DocumentId.ToString() == resourceId),
            "post" => _posts.FirstOrDefault(p => p.PostId.ToString() == resourceId),
            _ => null
        };

        if (resource == null)
        {
            return NotFound(new { Message = $"{resourceType} not found" });
        }

        // The ResourceOwner policy will automatically:
        // 1. Check if user is Admin (allow access to any resource)
        // 2. Extract owner ID from the resource object using reflection
        // 3. Compare with current user's ID from JWT token
        var authResult = await _authorizationService.AuthorizeAsync(User, resource, "ResourceOwner");
        if (!authResult.Succeeded)
        {
            return Forbid($"You don't have access to this {resourceType}.");
        }

        return Ok(new
        {
            ResourceType = resourceType,
            Resource = resource,
            Message = "Access granted - you own this resource or you're an admin"
        });
    }

    /// <summary>
    /// Shows current user's accessible resources
    /// </summary>
    [HttpGet("my-resources")]
    [Authorize]
    public Task<IActionResult> GetMyResources()
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var isAdmin = string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase);

        var result = new
        {
            CurrentUserId = currentUserId,
            IsAdmin = isAdmin,
            MyProfiles = isAdmin ? _profiles : _profiles.Where(p => p.UserId == currentUserId),
            MyDocuments = isAdmin ? _documents : _documents.Where(d => d.OwnerId == currentUserId),
            MyPosts = isAdmin ? _posts : _posts.Where(p => p.UserId == currentUserId)
        };

        return Task.FromResult<IActionResult>(Ok(result));
    }
}