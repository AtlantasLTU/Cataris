using API.Interfaces;
using API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace API.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        public TokenService(IConfiguration config)
        {
            _configuration = config ?? throw new ArgumentNullException(nameof(config));
        }
        public string createToken(ApplicationUsers users)
        {
            var secretKey = _configuration["AppSettings:TokenKey"];

            if (string.IsNullOrEmpty(secretKey))
            {
                throw new InvalidOperationException(
                    "AppSettings:TokenKey is missing. Set it with: dotnet user-secrets set \"AppSettings:TokenKey\" \"<32+ char string>\"");
            }

            if (string.IsNullOrEmpty(users.UserName))
            {
                throw new InvalidOperationException($"Cannot issue a token for user {users.Id}: UserName is not set.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, users.Id),
                new Claim(ClaimTypes.Name, users.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            var token = new JwtSecurityToken
            (
                issuer: null,
                audience: null,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
