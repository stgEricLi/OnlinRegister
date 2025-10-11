namespace OnlineRegister.Models;

/// <summary>
/// Example model for user profile data - demonstrates resource ownership
/// </summary>
public class UserProfile
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty; // Owner of this profile
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string ProfilePicture { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Example model for user documents - demonstrates resource ownership
/// </summary>
public class UserDocument
{
    public int DocumentId { get; set; }
    public string OwnerId { get; set; } = string.Empty; // Owner of this document
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public bool IsPrivate { get; set; } = true;
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Example model for user posts - demonstrates resource ownership
/// </summary>
public class UserPost
{
    public int PostId { get; set; }
    public string UserId { get; set; } = string.Empty; // Author/Owner
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> Tags { get; set; } = new();
}