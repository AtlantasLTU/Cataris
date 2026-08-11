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
        public static readonly MySqlServerVersion ServerVersion = new(new Version(8, 0, 43));

        public DataContext(DbContextOptions options) : base(options)
        {
        }
    }
}
