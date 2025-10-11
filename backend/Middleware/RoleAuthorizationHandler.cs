
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using OnlineRegister.Models;

namespace OnlineRegister.Middleware
{
    /// <summary>
    /// Custom authorization requirement for role-based access control
    /// </summary>
    public class RoleRequirement : IAuthorizationRequirement
    {
        public UserRole RequiredRole { get; }
        public bool AllowHigherRoles { get; }

        /// <summary>
        /// Creates a role requirement
        /// </summary>
        /// <param name="requiredRole">The minimum required role</param>
        /// <param name="allowHigherRoles">Whether higher roles should also be allowed (default: true)</param>
        public RoleRequirement(UserRole requiredRole, bool allowHigherRoles = true)
        {
            RequiredRole = requiredRole;
            AllowHigherRoles = allowHigherRoles;
        }
    }

    /// <summary>
    /// Custom authorization requirement for resource-based access control
    /// </summary>
    public class ResourceOwnerRequirement : IAuthorizationRequirement
    {
        public string ResourceIdClaimType { get; }

        /// <summary>
        /// Creates a resource owner requirement
        /// </summary>
        /// <param name="resourceIdClaimType">The claim type that contains the resource ID</param>
        public ResourceOwnerRequirement(string resourceIdClaimType = "sub")
        {
            ResourceIdClaimType = resourceIdClaimType;
        }
    }

    /// <summary>
    /// Authorization handler for role-based access control with hierarchical role support
    /// </summary>
    public class RoleAuthorizationHandler : AuthorizationHandler<RoleRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            RoleRequirement requirement)
        {
            // Check if user is authenticated
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                return Task.CompletedTask;
            }

            // Get the user's role from claims
            // In the JwtService at line 40, the role claim is being added to the JWT token
            var roleClaim = context.User.FindFirst(ClaimTypes.Role);
            if (roleClaim == null)
            {
                return Task.CompletedTask;
            }

            // Parse the role from the claim
            if (!Enum.TryParse<UserRole>(roleClaim.Value, out var userRole))
            {
                return Task.CompletedTask;
            }

            // Check if the user has the required role or higher
            if (HasRequiredRole(userRole, requirement.RequiredRole, requirement.AllowHigherRoles))
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;

        }

        /// <summary>
        /// Determines if the user role meets the requirement
        /// </summary>
        /// <param name="userRole">The user's current role</param>
        /// <param name="requiredRole">The minimum required role</param>
        /// <param name="allowHigherRoles">Whether higher roles should be allowed</param>
        /// <returns>True if the role requirement is met</returns>
        private static bool HasRequiredRole(UserRole userRole, UserRole requiredRole, bool allowHigherRoles)
        {
            if (allowHigherRoles)
            {
                // Allow the required role or any higher role (Admin > Manager > User)
                return (int)userRole >= (int)requiredRole;
            }
            else
            {
                // Only allow the exact role
                return userRole == requiredRole;
            }
        }
    }

    /// <summary>
    /// Authorization handler for resource-based access control
    /// Allows users to access their own resources or admins to access any resource
    /// </summary>
    public class ResourceOwnerAuthorizationHandler : AuthorizationHandler<ResourceOwnerRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            ResourceOwnerRequirement requirement)
        {
            // Check if user is authenticated
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                return Task.CompletedTask;
            }

            // Get the user's ID from claims
            var userIdClaim = context.User.FindFirst(requirement.ResourceIdClaimType);
            if (userIdClaim == null)
            {
                return Task.CompletedTask;
            }

            // Get the user's role from claims
            var roleClaim = context.User.FindFirst(ClaimTypes.Role);
            if (roleClaim != null && Enum.TryParse<UserRole>(roleClaim.Value, out var userRole))
            {
                // Admins can access any resource
                if (userRole == UserRole.Admin)
                {
                    context.Succeed(requirement);
                    return Task.CompletedTask;
                }
            }

            // Check if the resource belongs to the user
            var resource = context.Resource;
            if (resource != null)
            {
                // Try to get the resource owner ID through different methods
                string? resourceOwnerId = GetResourceOwnerId(resource);

                if (resourceOwnerId != null && resourceOwnerId == userIdClaim.Value)
                {
                    context.Succeed(requirement);
                }
            }

            return Task.CompletedTask;
        }

        /// <summary>
        /// Extracts the owner ID from a resource object
        /// </summary>
        /// <param name="resource">The resource object</param>
        /// <returns>The owner ID if found, null otherwise</returns>
        private static string? GetResourceOwnerId(object resource)
        {
            // Handle different resource types
            return resource switch
            {
                // If the resource has an Id property (for user resources)
                { } r when r.GetType().GetProperty("Id")?.GetValue(r) is string id => id,

                // If the resource has a UserId property
                { } r when r.GetType().GetProperty("UserId")?.GetValue(r) is string userId => userId,

                // If the resource has an OwnerId property
                { } r when r.GetType().GetProperty("OwnerId")?.GetValue(r) is string ownerId => ownerId,

                // If the resource is a string (representing a user ID)
                string resourceId => resourceId,

                _ => null
            };
        }
    }

    /// <summary>
    /// Authorization handler for manager-specific operations
    /// Allows managers to access resources within their scope and admins to access everything
    /// </summary>
    public class ManagerScopeAuthorizationHandler : AuthorizationHandler<RoleRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            RoleRequirement requirement)
        {
            // Only handle Manager role requirements
            // if (requirement.RequiredRole != UserRole.Manager)
            // {
            //     return Task.CompletedTask;
            // }

            // Check if user is authenticated
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                return Task.CompletedTask;
            }

            // Get the user's role from claims
            var roleClaim = context.User.FindFirst(ClaimTypes.Role);
            if (roleClaim == null || !Enum.TryParse<UserRole>(roleClaim.Value, out var userRole))
            {
                return Task.CompletedTask;
            }

            // Admins have full access
            if (userRole == UserRole.Admin)
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            // Managers have access to their scope
            if (userRole == UserRole.Manager)
            {
                // For now, managers have access to all user management operations
                // In a more complex system, this could check specific scope restrictions
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            return Task.CompletedTask;
        }
    }

    /// <summary>
    /// Extension methods for easier authorization handler registration
    /// </summary>
    public static class AuthorizationHandlerExtensions
    {
        /// <summary>
        /// Adds custom authorization handlers to the service collection
        /// </summary>
        /// <param name="services">The service collection</param>
        /// <returns>The service collection for chaining</returns>
        public static IServiceCollection AddCustomAuthorizationHandlers(this IServiceCollection services)
        {
            services.AddScoped<IAuthorizationHandler, RoleAuthorizationHandler>();
            services.AddScoped<IAuthorizationHandler, ResourceOwnerAuthorizationHandler>();
            services.AddScoped<IAuthorizationHandler, ManagerScopeAuthorizationHandler>();

            return services;
        }

        /// <summary>
        /// Configures custom authorization policies using the custom handlers
        /// The this AuthorizationOptions options parameter makes it an extension method
        /// You can then use these policies in your controllers like: [Authorize(Policy = "AdminOnly")]
        /// </summary>
        /// <param name="options">Authorization options to configure</param>
        public static void ConfigureCustomPolicies(this AuthorizationOptions options)
        {
            // Policy for operations requiring Admin role only
            options.AddPolicy("AdminOnly", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.Requirements.Add(new RoleRequirement(UserRole.Admin, allowHigherRoles: false));
            });

            // Policy for operations requiring Manager role or higher
            options.AddPolicy("ManagerOrHigher", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.Requirements.Add(new RoleRequirement(UserRole.Manager, allowHigherRoles: true));
            });

            // Policy for operations requiring User role or higher (any authenticated user)
            options.AddPolicy("UserOrHigher", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.Requirements.Add(new RoleRequirement(UserRole.User, allowHigherRoles: true));
            });

            // Policy for resource owner access (user can access their own resources, admins can access any)
            options.AddPolicy("ResourceOwner", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.Requirements.Add(new ResourceOwnerRequirement());
            });

            // Policy for manager scope operations
            options.AddPolicy("ManagerScope", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.Requirements.Add(new RoleRequirement(UserRole.Manager));
            });
        }

    }

}