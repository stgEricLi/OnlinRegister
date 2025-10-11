# 🔐 Custom Authorization System Guide

## Overview

Your application now uses a sophisticated custom authorization system with hierarchical role-based access control. The system supports three roles with different permission levels:

- **User** (Level 0) - Basic access
- **Manager** (Level 1) - Elevated access
- **Admin** (Level 2) - Full access

## ✅ Applied to GetAllUsers() API

The `GetAllUsers()` method in `UsersController` now uses the custom authorization:

```csharp
[HttpGet]
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> GetAllUsers()
```

### What This Does:

1. **Requires Authentication** - User must have a valid JWT token
2. **Requires Admin Role** - Only users with `UserRole.Admin` can access
3. **Case-Insensitive** - "Admin", "admin", "ADMIN" all work
4. **Hierarchical** - Uses the custom `RoleAuthorizationHandler` for proper role checking

## 🎯 Available Authorization Policies

### 1. `AdminOnly`

- **Usage**: `[Authorize(Policy = "AdminOnly")]`
- **Access**: Only Admin users (exact role match)
- **Example**: User management, system configuration

### 2. `ManagerOrHigher`

- **Usage**: `[Authorize(Policy = "ManagerOrHigher")]`
- **Access**: Manager and Admin users
- **Example**: User reports, team management

### 3. `UserOrHigher`

- **Usage**: `[Authorize(Policy = "UserOrHigher")]`
- **Access**: Any authenticated user (User, Manager, Admin)
- **Example**: Profile access, basic operations

### 4. `ResourceOwner`

- **Usage**: `[Authorize(Policy = "ResourceOwner")]`
- **Access**: Users can access their own resources, Admins can access any
- **Example**: Personal data, user-specific content

### 5. `ManagerScope`

- **Usage**: `[Authorize(Policy = "ManagerScope")]`
- **Access**: Manager-specific operations
- **Example**: Team management within scope

## 🚀 Updated UsersController Methods

### GetAllUsers() - Admin Only

```csharp
[HttpGet]
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> GetAllUsers()
```

- ✅ Only Admin users can access
- ✅ Returns list of all users
- ✅ Uses custom authorization handler

### GetUser(id) - Smart Access Control

```csharp
[HttpGet("{id}")]
[Authorize(Policy = "UserOrHigher")]
public async Task<IActionResult> GetUser(string id)
```

- ✅ Users can access their own data
- ✅ Managers/Admins can access any user data
- ✅ Proper authorization checks

### DeleteUser(id) - Admin Only

```csharp
[HttpDelete("{id}")]
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> DeleteUser(string id)
```

- ✅ Only Admin users can delete
- ✅ Uses custom authorization handler

## 🧪 Testing the Authorization

### 1. Test Endpoints Available

Use the new `AuthTestController` to test different authorization levels:

```
GET /api/authtest/public              - No auth required
GET /api/authtest/user-or-higher      - Any authenticated user
GET /api/authtest/manager-or-higher   - Manager or Admin
GET /api/authtest/admin-only          - Admin only
GET /api/authtest/user-info           - Shows your claims
GET /api/authtest/role-hierarchy-test - Tests role hierarchy
```

### 2. Create Test Users

Make sure your database has users with the correct roles:

```sql
-- Admin user
UPDATE Users SET role = 'Admin' WHERE Username = 'admin';

-- Manager user
UPDATE Users SET role = 'Manager' WHERE Username = 'manager';

-- Regular user
UPDATE Users SET role = 'User' WHERE Username = 'user';
```

### 3. Test Scenarios

| Endpoint                              | User Token | Manager Token | Admin Token | No Token |
| ------------------------------------- | ---------- | ------------- | ----------- | -------- |
| `GET /api/users`                      | ❌ 403     | ❌ 403        | ✅ 200      | ❌ 401   |
| `GET /api/users/me`                   | ✅ 200     | ✅ 200        | ✅ 200      | ❌ 401   |
| `GET /api/users/{id}`                 | ✅ 200\*   | ✅ 200        | ✅ 200      | ❌ 401   |
| `DELETE /api/users/{id}`              | ❌ 403     | ❌ 403        | ✅ 200      | ❌ 401   |
| `GET /api/authtest/manager-or-higher` | ❌ 403     | ✅ 200        | ✅ 200      | ❌ 401   |

\*Users can only access their own data

## 🔧 How It Works

### 1. JWT Token Contains Role

When users login, their role is added to the JWT token:

```csharp
new Claim(ClaimTypes.Role, user.Role ?? "User")
```

### 2. Custom Authorization Handler

The `RoleAuthorizationHandler` processes authorization requirements:

- Checks if user is authenticated
- Extracts role from JWT claims
- Compares against required role using hierarchy
- Allows access if role meets requirements

### 3. Role Hierarchy

```csharp
public enum UserRole
{
    User = 0,     // Basic access
    Manager = 1,  // Elevated access
    Admin = 2     // Full access
}
```

Higher roles automatically include lower role permissions.

## 🛠️ Adding New Authorization

### 1. Create New Policy

Add to `ConfigureCustomPolicies()` in `RoleAuthorizationHandler.cs`:

```csharp
options.AddPolicy("SuperAdmin", policy =>
{
    policy.RequireAuthenticatedUser();
    policy.Requirements.Add(new RoleRequirement(UserRole.Admin, allowHigherRoles: false));
    policy.RequireClaim("Department", "IT"); // Additional claim requirement
});
```

### 2. Use in Controller

```csharp
[HttpGet("super-admin-only")]
[Authorize(Policy = "SuperAdmin")]
public IActionResult GetSuperAdminData() { ... }
```

## 🔍 Debugging Authorization

### Enable Debug Logging

Add to `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "OnlineRegister.Middleware": "Debug",
      "Microsoft.AspNetCore.Authorization": "Information"
    }
  }
}
```

### Check User Claims

Use the `/api/authtest/user-info` endpoint to see what claims are in your JWT token.

### Common Issues

1. **403 Forbidden**: User authenticated but wrong role
2. **401 Unauthorized**: No JWT token or invalid token
3. **Role not found**: Check database role values match enum

## 🎉 Benefits

✅ **Hierarchical Roles** - Higher roles automatically get lower permissions  
✅ **Flexible Policies** - Easy to create custom authorization rules  
✅ **Standard ASP.NET Core** - Uses familiar `[Authorize]` attributes  
✅ **Comprehensive Logging** - Easy to debug authorization issues  
✅ **Type Safety** - Uses enums for role definitions  
✅ **Extensible** - Easy to add new roles and policies

Your `GetAllUsers()` API is now protected with enterprise-grade authorization! 🚀
