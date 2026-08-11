using API.Data;
using API.DbInitializer;
using API.Interfaces;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationService(this IServiceCollection services, IConfiguration config)
        {
            var connectionString = config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found");

            services.AddDbContext<DataContext>(options =>
                options.UseMySql(connectionString, DataContext.ServerVersion));

            services.AddIdentity<ApplicationUsers, IdentityRole>()
                .AddEntityFrameworkStores<DataContext>()
                .AddDefaultTokenProviders();
            services.AddScoped<IDbInitializer, API.DbInitializer.DbInitializer>();
            services.AddControllers();

            // [ApiController] short-circuits invalid models with its own ProblemDetails
            // shape before the action runs. The front-end reads `error`, so reshape it
            // to match -- otherwise validation failures surface as a blank message.
            services.Configure<ApiBehaviorOptions>(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var message = context.ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .FirstOrDefault() ?? "Invalid request";
                    return new BadRequestObjectResult(new { error = message });
                };
            });

            //services
            services.AddScoped<ITokenService, TokenService>();

            var secretKey = config["AppSettings:TokenKey"] ?? throw new ArgumentNullException("AppSettings:TokenKey JWT Secret Token key is missing from the configuration");

            // All three must be set explicitly: AddIdentity() above already pointed
            // DefaultAuthenticateScheme at the Identity cookie, and that wins over
            // DefaultScheme -- so [Authorize] would try cookie auth and always 401.
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                };
            });

            return services;
        }
    }
}
