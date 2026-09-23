using GameShelf.Api.Data;
using GameShelf.Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

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

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Seed / create the SQLite database on startup.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GameShelfDbContext>();
    await DbInitializer.SeedAsync(db);
}

// Eenvoudige controle om te zien of de API lokaal draait.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// De controllers voor de GameShelf-modules worden later toegevoegd.
app.MapControllers();

app.Run();