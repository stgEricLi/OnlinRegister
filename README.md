# OnlineRegister

A full-stack online registration system built with .NET Core Web API backend and modern frontend.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) or later
- [Node.js](https://nodejs.org/) (version 16 or later)
- [Git](https://git-scm.com/)
- A code editor like [Visual Studio Code](https://code.visualstudio.com/)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd OnlineRegister
```

### 2. Backend Setup (.NET Core Web API)

Navigate to the backend directory and restore dependencies:

Install Nuget packages

> dotnet add package Microsoft.EntityFrameworkCore.SqlServer
> dotnet add package Microsoft.EntityFrameworkCore.Tools
> dotnet add package Microsoft.EntityFrameworkCore.Design
> dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore --version 8.0.10
> dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.10
> dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
> dotnet add package FluentValidation.AspNetCore
> dotnet add package Serilog.AspNetCore
> dotnet add package Swashbuckle.AspNetCore
> dotnet add package Microsoft.AspNetCore.Cors
> dotnet add package System.IdentityModel.Tokens.Jwt

Fixing the HTTPS Certificate Issue:
.NET might not find or trust the development SSL certificate.

Solution 1: Trust the Development Certificate (Recommended)

> dotnet dev-certs https --trust

Clean up any old certificates and ensure everything is properly configured:

> dotnet dev-certs https --check

Verify it's trusted:
dotnet dev-certs https --check --trust

Solution 2: Use HTTP Only for Development
To avoid HTTPS issues during development, let's create an HTTP-only debug configuration:
And add code at Program.cs to avoid using https

```bash
cd backend/OnlineRegister
dotnet restore
```

Build the project:

```bash
dotnet build
```

Run the API:

```bash
dotnet run
```

The API will be available at:

- HTTPS: `https://localhost:7000`
- HTTP: `http://localhost:5000`

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Installed Backend Packages

The backend comes pre-configured with essential packages for a robust online registration system:

### Core Packages

- **Microsoft.AspNetCore.Identity.EntityFrameworkCore** (8.0.10) - User authentication and authorization
- **Microsoft.EntityFrameworkCore.SqlServer** (9.0.9) - SQL Server database provider
- **Microsoft.EntityFrameworkCore.Design** (9.0.9) - EF Core design-time tools
- **Microsoft.EntityFrameworkCore.Tools** (9.0.9) - EF Core CLI tools

### Authentication & Security

- **Microsoft.AspNetCore.Authentication.JwtBearer** (8.0.10) - JWT token authentication
- **System.IdentityModel.Tokens.Jwt** (8.14.0) - JWT token handling

### API Documentation & Validation

- **Swashbuckle.AspNetCore** (9.0.6) - Swagger/OpenAPI documentation
- **FluentValidation.AspNetCore** (11.3.1) - Model validation

### Utilities & Mapping

- **AutoMapper.Extensions.Microsoft.DependencyInjection** (12.0.1) - Object-to-object mapping
- **Serilog.AspNetCore** (9.0.0) - Structured logging
- **Microsoft.AspNetCore.Cors** (2.3.0) - Cross-origin resource sharing

## Development Commands

### Backend Commands

```bash
# Navigate to backend
cd backend/OnlineRegister

# Restore packages
dotnet restore

# Build the project
dotnet build

# Run the application
dotnet run

# Run with hot reload
dotnet watch run

# Create a new migration (if using Entity Framework)
dotnet ef migrations add <MigrationName>

# Update database
dotnet ef database update

# Add a new package
dotnet add package <PackageName>
```

### Frontend Commands

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Install a new package
npm install <package-name>
```

## Project Structure

```
OnlineRegister/
├── backend/                    # .NET Core Web API project
│   ├── Controllers/            # API controllers (AuthController, UsersController)
│   ├── Services/              # Business logic layer (UserService)
│   ├── Repositories/          # Data access layer implementations
│   ├── Models/                # Entity models (User)
│   ├── DTOs/                  # Data Transfer Objects (RegisterDto, LoginDto)
│   ├── Interfaces/            # Service and repository interfaces
│   ├── Data/                  # DbContext and database configurations
│   ├── Validators/            # FluentValidation validators
│   ├── Configurations/        # AutoMapper profiles and service configs
│   ├── Middleware/            # Custom middleware components
│   ├── Helpers/               # Utility classes and extensions
│   ├── Program.cs             # Application entry point
│   └── appsettings.json       # Configuration
├── frontend/                  # Frontend application
└── README.md                  # This file
```

## API Endpoints

Once the backend is running, you can access:

- Swagger UI: `https://localhost:7000/swagger`
- API Base URL: `https://localhost:7000/api`

## Environment Configuration

### Backend Configuration

Update `appsettings.json` in the backend project for:

- Database connection strings
- CORS settings
- Authentication settings

### Frontend Configuration

Create environment files in the frontend directory:

- `.env.development` - Development environment variables
- `.env.production` - Production environment variables

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `launchSettings.json` (backend) or frontend configuration
2. **CORS errors**: Ensure CORS is properly configured in the backend
3. **Package restore fails**: Clear NuGet cache with `dotnet nuget locals all --clear`

### Useful Commands

```bash
# Check .NET version
dotnet --version

# Check Node.js version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## 🐛 Debugging in Kiro IDE

### Quick Start Debugging with F5

All debug settings has been added to launch.json and task.json file
Your project is now configured for debugging directly in Kiro IDE! Here's how:

#### **Step 1: Set Breakpoints**

1. Open `backend/Program.cs`
2. Click on the left margin (line numbers area) to set breakpoints
3. Red dots will appear indicating active breakpoints

#### **Step 2: Start Debugging**

1. **Press F5** or open Run and Debug panel (Ctrl+Shift+D)
2. Select "**.NET Core Launch (web)**" from the dropdown
3. Click the green play button
4. Your API starts with debugger attached
5. Browser automatically opens to Swagger UI

#### **Step 3: Debug Controls**

- **F5**: Continue execution
- **F10**: Step Over (next line)
- **F11**: Step Into (enter method)
- **Shift+F11**: Step Out (exit method)
- **Ctrl+Shift+F5**: Restart debugging
- **Shift+F5**: Stop debugging

### Debug Features in Kiro

#### **Variables Panel**

- View all local variables and their values
- Expand objects to see properties
- Values update in real-time as you step through code

#### **Watch Panel**

- Add expressions to monitor: `myVariable.Property`
- Evaluate complex expressions during debugging
- Track specific values across method calls

#### **Debug Console**

- Execute C# code while debugging
- Test expressions: `DateTime.Now`
- Call methods: `myObject.SomeMethod()`

#### **Call Stack**

- See the complete execution path
- Navigate between method calls
- Understand how you reached the current breakpoint

### Example: Debug the Weather API

```csharp
app.MapGet("/weatherforecast", () =>
{
    // Set breakpoint here ← Click on line 23 margin
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast(
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55), // Breakpoint here to see random values
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast; // Final breakpoint to inspect results
});
```

### Alternative: Terminal Debugging

If you prefer terminal-based development:

```bash
# Navigate to backend
cd backend

# Run with hot reload (recommended for development)
dotnet watch run

# Or run normally
dotnet run

# Run with specific profile
dotnet run --launch-profile https
```

### Your API Endpoints

Once running, your API will be available at:

- **HTTPS**: `https://localhost:7024`
- **HTTP**: `http://localhost:5147`
- **Swagger UI**: `https://localhost:7024/swagger`
- **Weather API**: `https://localhost:7024/weatherforecast`

### Debugging Tips

1. **Set breakpoints before starting** - They're easier to hit this way
2. **Use the Debug Console** - Great for testing expressions
3. **Check the Variables panel** - See all values without hovering
4. **Use conditional breakpoints** - Right-click breakpoint → Add condition
5. **Hot reload works while debugging** - Make changes and see them instantly

🎯 **Pro Tip**: The Swagger UI that opens automatically is perfect for testing your API endpoints while debugging. Set breakpoints in your endpoints and then trigger them from Swagger!

Now you're ready to debug like a pro in Kiro! Hit F5 and start building your online registration system! 🚀
#   O n l i n R e g i s t e r  
 