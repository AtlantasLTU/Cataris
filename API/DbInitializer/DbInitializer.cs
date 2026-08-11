using API.Data;
using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.DbInitializer
{
    public class DbInitializer : IDbInitializer
    {
        private readonly DataContext _context;
        private readonly UserManager<ApplicationUsers> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        public DbInitializer(DataContext context, UserManager<ApplicationUsers> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }
        public void Initialize()
        {
            if (_context.Database.GetPendingMigrations().Count() > 0)
            {
                _context.Database.Migrate();
            }
            if(_context.Roles.Any(x => x.Name == Utility.Helper.Admin))
            {
                return;
            }
            _roleManager.CreateAsync(new IdentityRole(Utility.Helper.Admin)).GetAwaiter().GetResult();
            _roleManager.CreateAsync(new IdentityRole(Utility.Helper.User)).GetAwaiter().GetResult();

            var admin = new ApplicationUsers
            {
                UserName = "admin",
                Email = "admin@gmail.com",
                EmailConfirmed = true,
                Name = "Admin",
                Balance = 1000m
            };

            var created = _userManager.CreateAsync(admin, "Admin123!").GetAwaiter().GetResult();
            if (!created.Succeeded)
            {
                throw new InvalidOperationException(
                    "Failed to seed the admin account: " + string.Join(" ", created.Errors.Select(e => e.Description)));
            }

            _userManager.AddToRoleAsync(admin, Utility.Helper.Admin).GetAwaiter().GetResult();
        }
    }
}
