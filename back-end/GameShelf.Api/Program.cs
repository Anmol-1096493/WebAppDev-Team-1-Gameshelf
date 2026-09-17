var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

// Eenvoudige controle om te zien of de API lokaal draait.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// De controllers voor de GameShelf-modules worden later toegevoegd.
app.MapControllers();

app.Run();
