using GameShelf.Api.Data;
using GameShelf.Api.Services;
using GameShelf.Api.Swagger;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "GameShelf API",
        Version = "v1",
        Description = "Authentication and game session endpoints for GameShelf."
    });
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "GameShelf.Api.xml"));
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        Description = "Enter the token returned by POST /api/auth/login."
    });
    options.OperationFilter<BearerSecurityOperationFilter>();
});

// SQLite database stored in gameshelf.db next to the project file.
var dbPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "gameshelf.db");
builder.Services.AddDbContext<GameShelfDbContext>(o => o.UseSqlite($"Data Source={dbPath}"));
builder.Services.AddScoped<SessionService>();
builder.Services.AddSingleton<TokenService>();

// Bearer-token login for the prototype. Tokens are HMAC-signed and sent by the
// frontend in the Authorization header.
builder.Services.AddAuthentication("Bearer")
    .AddScheme<AuthenticationSchemeOptions, BearerAuthHandler>("Bearer", _ => { });
builder.Services.AddAuthorization();

// The React dev server runs on a different port; allow it.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Seed / create the SQLite database on startup.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GameShelfDbContext>();
    await DbInitializer.SeedAsync(db);
}

// Lightweight health check for local development.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .WithName("Health")
    .WithSummary("Checks whether the API is running.");

// Map authentication, session, member and game controllers.
app.MapControllers();

app.Run();
