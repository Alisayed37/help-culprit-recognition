using System.Text;
using ForensicApi.Data;
using ForensicApi.Middleware;
using ForensicApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Allow large multi-file uploads (default Kestrel body limit is ~28 MB and the
// multipart value-count limit is 1024 — both too low for bulk image uploads).
builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = null); // unlimited
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = long.MaxValue;
    o.ValueCountLimit = int.MaxValue;
    o.MultipartHeadersCountLimit = int.MaxValue;
});

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Application services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<IInvestigationService, InvestigationService>();

var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"] ?? "");
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"]
    };
});

// Allow our API to talk to the Python Microservice
builder.Services.AddHttpClient();

// Allow React (which usually runs on localhost:3000 or 5173) to talk to this API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

// Ensure the database and schema exist (no migrations in this project).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
}

// Global exception handler — must wrap the whole pipeline
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

var investigationPath = Path.Combine(Directory.GetCurrentDirectory(), "InvestigationData");
Directory.CreateDirectory(investigationPath); // Ensure it exists

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(investigationPath),
    RequestPath = "/images"
});

app.MapControllers();

app.Run();
