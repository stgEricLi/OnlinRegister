using Microsoft.AspNetCore.Mvc;
using OnlineRegister.Interfaces;

namespace OnlineRegister.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService userService, ILogger<UsersController> logger) : ControllerBase
{

    /// <summary>
    /// Get all users
    /// </summary>
    /// <returns>List of all active users</returns>
    [HttpGet]
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
    /// Get user by ID
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User information</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        try
        {
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
    /// Delete user (soft delete)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>Success message</returns>
    [HttpDelete("{id}")]
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
}