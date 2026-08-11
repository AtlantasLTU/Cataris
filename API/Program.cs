using API.DbInitializer;
using API.Extensions;

var builder = WebApplication.CreateBuilder(args);

const string FrontEnd = "FrontEnd";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontEnd, policy =>
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// Add services to the container.
builder.Services.AddApplicationService(builder.Configuration);

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbInitializer = services.GetRequiredService<IDbInitializer>();
        dbInitializer.Initialize();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "ERORR INITIALIZING DB");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Skipped in development: the front-end talks to the plain http:// endpoint, and a
// redirect to https would break those calls (and the CORS preflight with them).
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors(FrontEnd);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
