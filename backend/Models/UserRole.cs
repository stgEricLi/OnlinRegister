namespace OnlineRegister.Models
{
    /// <summary>
    /// Defines the different user roles in the system for role-based authorization
    /// </summary>
    public enum UserRole
    {
        /// <summary>
        /// Regular user with basic access permissions
        /// </summary>
        User = 0,

        /// <summary>
        /// Manager with elevated permissions for managing users within their scope
        /// </summary>
        Manager = 1,

        /// <summary>
        /// Administrator with full access to all system resources and operations
        /// </summary>
        Admin = 2
    }
}