using API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

    //bridge
namespace API.Data
{
    public class DataContext : IdentityDbContext<ApplicationUsers>
    {
        // Pinned so EF never needs a live connection to detect the server version
        // (AutoDetect would require the database to be up at design time).
        // Bump to match your actual MariaDB version (SELECT VERSION();) if it differs.
        public static readonly ServerVersion ServerVersion = new MariaDbServerVersion(new Version(10, 11, 0));

        public DataContext(DbContextOptions options) : base(options)
        {
        }
    }
}
