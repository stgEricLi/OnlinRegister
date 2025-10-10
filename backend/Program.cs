using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FluentValidation;
using Serilog;
using OnlineRegister.Data;
using OnlineRegister.Models;
using OnlineRegister.Services;
using OnlineRegister.Interfaces;
using OnlineRegister.Configurations;
using OnlineRegister.Validators;
using OnlineRegister.DTOs;
using OnlineRegister.Helpers;
using OnlineRegister.Middleware;

var builder = WebApplication.CreateBuilder(args);

//  Serilog replaces default logging - ILogger is registered automatically here
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog(); // ← This registers ILogger!

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

// Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Custom Identity Services (no ASP.NET Core Identity)
// You'll handle authentication manually in your UserService

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// FluentValidation
builder.Services.AddScoped<IValidator<RegisterDto>, RegisterDtoValidator>();
builder.Services.AddScoped<IValidator<LoginDto>, LoginDtoValidator>();

// Application Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<JwtHelper>();

// Controllers
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "OnlineRegister API", Version = "v1" });

    // Add JWT Authentication to Swagger with proper Bearer token support
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = @"JWT Authorization header using the Bearer scheme. 
                      Enter 'Bearer' [space] and then your token in the text input below.
                      Example: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" },
                Scheme = "oauth2",
                Name = "Bearer",
                In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            },
            new List<string>()
        }
    });

    // Enable XML comments for better documentation
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Configure the HTTP request pipeline.

// Global Exception Handling
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Development-specific middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "OnlineRegister API v1");
        c.RoutePrefix = string.Empty; // ← This makes Swagger UI the root page
        c.DocumentTitle = "OnlineRegister API Documentation";

        // Enhanced UI features for better JWT token handling
        c.DefaultModelsExpandDepth(-1); // Hide models section by default
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None); // Collapse all endpoints by default
        c.EnableDeepLinking(); // Enable deep linking for sharing URLs
        c.EnableFilter(); // Enable search/filter box
        c.ShowExtensions(); // Show vendor extensions
        c.EnableValidator(); // Enable request/response validation
        c.SupportedSubmitMethods(Swashbuckle.AspNetCore.SwaggerUI.SubmitMethod.Get,
                                Swashbuckle.AspNetCore.SwaggerUI.SubmitMethod.Post,
                                Swashbuckle.AspNetCore.SwaggerUI.SubmitMethod.Put,
                                Swashbuckle.AspNetCore.SwaggerUI.SubmitMethod.Delete);

        // Custom CSS and JS for better token management
        c.InjectStylesheet("/swagger-ui/custom.css");
        c.InjectJavascript("/swagger-ui/custom.js");
    });
}

// Static Files (for custom Swagger UI assets)
app.UseStaticFiles();

// CORS
app.UseCors("AllowAll");

// HTTPS Redirection
if (!app.Environment.IsDevelopment() || app.Configuration["ASPNETCORE_URLS"]?.Contains("https") == true)
{
    app.UseHttpsRedirection();
}

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Controllers
app.MapControllers();

// Health Check Endpoint
// app.MapGet("/health", () => new { Status = "Healthy", Timestamp = DateTime.UtcNow })
//     .WithName("HealthCheck")
//     .WithOpenApi();

// // Test Database Connection
// using (var scope = app.Services.CreateScope())
// {
//     try
//     {
//         var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

//         // Test database connection
//         await context.Database.CanConnectAsync();
//         Log.Information("Database connection successful");
//     }
//     catch (Exception ex)
//     {
//         Log.Error(ex, "Database connection failed");
//         // Don't throw - let the application start but log the error
//     }
// }

// var summaries = new[]
// {
//     "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
// };

// app.MapGet("/weatherforecast", () =>
// {
//     var forecast = Enumerable.Range(1, 5).Select(index =>
//         new WeatherForecast
//         (
//             DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
//             Random.Shared.Next(-20, 55),
//             summaries[Random.Shared.Next(summaries.Length)]
//         ))
//         .ToArray();
//     return forecast;
// })
// .WithName("GetWeatherForecast")
// .WithOpenApi();

try
{
    Log.Information("Starting OnlineRegister API");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

// record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
// {
//     public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
// }
