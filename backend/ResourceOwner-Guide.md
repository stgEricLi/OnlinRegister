# 🔐 ResourceOwnerAuthorizationHandler Guide

## 🎯 What is Resource-Based Authorization?

The `ResourceOwnerAuthorizationHandler` implements **resource-based access control** where users can only access resources they own, while admins can access any resource.

### Core Principle

> **"Users own their data, Admins manage everything"**

## 🔧 How ResourceOwnerAuthorizationHandler Works

### 1. **Authentication Check**

```csharp
if (!context.User.Identity?.IsAuthenticated ?? true)
{
    return Task.CompletedTask; // Must be logged in
}
```

### 2. **Admin Bypass Rule**

```csharp
if (userRole == UserRole.Admin)
{
    context.Succeed(requirement); // Admins can access ANY resource
    return Task.CompletedTask;
}
```

### 3. **Resource Ownership Detection**

The handler automatically detects owner IDs from different property patterns:

```csharp
private static string? GetResourceOwnerId(object resource)
{
    return resource switch
    {
        // User profile: { Id: "123" } → returns "123"
        { } r when r.GetType().GetProperty("Id")?.GetValue(r) is string id => id,

        // User content: { UserId: "123" } → returns "123"
        { } r when r.GetType().GetProperty("UserId")?.GetValue(r) is string userId => userId,

        // Owned resource: { OwnerId: "123" } → returns "123"
        { } r when r.GetType().GetProperty("OwnerId")?.GetValue(r) is string ownerId => ownerId,

        // Direct ID: "123" → returns "123"
        string resourceId => resourceId,

        _ => null // No owner found
    };
}
```

### 4. **Ownership Comparison**

```csharp
if (resourceOwnerId != null && resourceOwnerId == userIdClaim.Value)
{
    context.Succeed(requirement); // User owns this resource
}
```

## 📋 Real-World Examples

### Example 1: User Profile Access

```csharp
[HttpGet("profiles/{userId}")]
[Authorize(Policy = "ResourceOwner")]
public async Task<IActionResult> GetUserProfile(string userId)
{
    var profile = await GetProfileByUserId(userId);

    // ResourceOwner policy automatically checks:
    // ✅ Is current user ID == userId? (ownership)
    // ✅ OR is current user Admin? (bypass)

    return Ok(profile);
}
```

**Access Matrix:**
| User | Accessing Profile | Result |
|------|------------------|--------|
| User123 | Profile of User123 | ✅ Allow (owns it) |
| User123 | Profile of User456 | ❌ Forbid (doesn't own) |
| Admin | Profile of User123 | ✅ Allow (admin bypass) |
| Admin | Profile of User456 | ✅ Allow (admin bypass) |

### Example 2: Document Management

```csharp
public class UserDocument
{
    public int DocumentId { get; set; }
    public string OwnerId { get; set; } // ← Handler detects this
    public string Title { get; set; }
    public bool IsPrivate { get; set; }
}

[HttpGet("documents/{documentId}")]
[Authorize(Policy = "ResourceOwner")]
public async Task<IActionResult> GetDocument(int documentId)
{
    var document = await GetDocumentById(documentId);

    // Manual authorization check with resource object
    var authResult = await _authorizationService.AuthorizeAsync(User, document, "ResourceOwner");
    if (!authResult.Succeeded)
    {
        return Forbid("You can only access your own documents.");
    }

    return Ok(document);
}
```

### Example 3: User Posts

```csharp
public class UserPost
{
    public int PostId { get; set; }
    public string UserId { get; set; } // ← Handler detects this
    public string Content { get; set; }
}

[HttpPut("posts/{postId}")]
[Authorize(Policy = "ResourceOwner")]
public async Task<IActionResult> UpdatePost(int postId, UserPost updatedPost)
{
    var existingPost = await GetPostById(postId);

    // ResourceOwner policy checks if current user's ID matches post.UserId
    var authResult = await _authorizationService.AuthorizeAsync(User, existingPost, "ResourceOwner");
    if (!authResult.Succeeded)
    {
        return Forbid("You can only edit your own posts.");
    }

    // Update logic here...
    return Ok(updatedPost);
}
```

## 🎯 Usage Patterns

### Pattern 1: Attribute-Only Authorization

```csharp
[HttpGet("my-data/{id}")]
[Authorize(Policy = "ResourceOwner")]
public IActionResult GetMyData(string id)
{
    // Policy automatically checks if 'id' matches current user ID
    // Works when the resource IS the user ID
}
```

### Pattern 2: Manual Authorization Check

```csharp
[HttpGet("documents/{id}")]
[Authorize(Policy = "UserOrHigher")]
public async Task<IActionResult> GetDocument(int id)
{
    var document = await GetDocumentById(id);

    // Manual check with resource object
    var authResult = await _authorizationService.AuthorizeAsync(User, document, "ResourceOwner");
    if (!authResult.Succeeded)
    {
        return Forbid();
    }

    return Ok(document);
}
```

### Pattern 3: Hybrid Approach

```csharp
[HttpDelete("posts/{postId}")]
[Authorize(Policy = "ResourceOwner")]
public async Task<IActionResult> DeletePost(int postId)
{
    var post = await GetPostById(postId);

    // Additional business logic checks
    if (post.IsPublished && !IsAdmin())
    {
        return BadRequest("Cannot delete published posts");
    }

    // ResourceOwner policy already verified ownership
    await DeletePost(post);
    return Ok();
}
```

## 🔄 Integration with Other Handlers

The `ResourceOwnerAuthorizationHandler` works alongside other handlers:

```csharp
// Multiple handlers can process the same request
[Authorize(Policy = "ManagerOrHigher")] // ← RoleAuthorizationHandler
[Authorize(Policy = "ResourceOwner")]   // ← ResourceOwnerAuthorizationHandler
public IActionResult ComplexEndpoint() { ... }
```

## 🛠️ Advanced Scenarios

### Custom Resource Types

```csharp
public class TeamProject
{
    public int ProjectId { get; set; }
    public string TeamLeaderId { get; set; } // ← Custom ownership property
    public List<string> MemberIds { get; set; } = new();
}

// Extend the handler for custom ownership logic
private static string? GetResourceOwnerId(object resource)
{
    return resource switch
    {
        TeamProject project => project.TeamLeaderId, // Custom logic
        UserDocument doc => doc.OwnerId,
        UserProfile profile => profile.UserId,
        string directId => directId,
        _ => null
    };
}
```

### Multi-Owner Resources

```csharp
public class SharedDocument
{
    public int Id { get; set; }
    public List<string> OwnerIds { get; set; } = new(); // Multiple owners
}

// Enhanced handler for multiple owners
private static bool IsResourceOwner(object resource, string userId)
{
    return resource switch
    {
        SharedDocument doc => doc.OwnerIds.Contains(userId),
        UserDocument doc => doc.OwnerId == userId,
        _ => GetResourceOwnerId(resource) == userId
    };
}
```

## 🧪 Testing Resource Ownership

### Test Scenarios

```csharp
// Test data
var user123Token = "Bearer eyJ..."; // User ID: 123
var user456Token = "Bearer eyJ..."; // User ID: 456
var adminToken = "Bearer eyJ...";   // Admin user

// Test cases
GET /api/profiles/123 with user123Token → ✅ 200 (owns profile)
GET /api/profiles/456 with user123Token → ❌ 403 (doesn't own)
GET /api/profiles/456 with adminToken   → ✅ 200 (admin bypass)

PUT /api/documents/1 with user123Token → ✅ 200 (if document.OwnerId == "123")
PUT /api/documents/1 with user456Token → ❌ 403 (if document.OwnerId == "123")
PUT /api/documents/1 with adminToken   → ✅ 200 (admin bypass)
```

### Debug Resource Ownership

```csharp
[HttpGet("debug/resource-ownership/{resourceType}/{resourceId}")]
[Authorize]
public async Task<IActionResult> DebugOwnership(string resourceType, string resourceId)
{
    var resource = await GetResource(resourceType, resourceId);
    var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var isAdmin = User.IsInRole("Admin");

    var resourceOwnerId = GetResourceOwnerId(resource);
    var ownsResource = resourceOwnerId == currentUserId;

    return Ok(new {
        CurrentUserId = currentUserId,
        IsAdmin = isAdmin,
        ResourceOwnerId = resourceOwnerId,
        OwnsResource = ownsResource,
        WouldAllowAccess = isAdmin || ownsResource
    });
}
```

## 🎯 Key Benefits

✅ **Automatic Ownership Detection** - No manual ID checking in controllers  
✅ **Admin Bypass** - Admins can access any resource automatically  
✅ **Flexible Resource Types** - Works with any object with owner properties  
✅ **Declarative Security** - Use `[Authorize(Policy = "ResourceOwner")]`  
✅ **Consistent Behavior** - Same ownership logic across all endpoints  
✅ **Easy Testing** - Clear ownership rules make testing straightforward

## 🚨 Security Considerations

1. **Always Validate Resource Exists** before authorization check
2. **Use HTTPS** to protect JWT tokens containing user IDs
3. **Validate Resource IDs** to prevent injection attacks
4. **Log Authorization Failures** for security monitoring
5. **Consider Soft Deletes** for audit trails on owned resources

The `ResourceOwnerAuthorizationHandler` provides enterprise-grade resource-based security with minimal code complexity! 🚀
