using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace API.Data
{
    // Used only by `dotnet ef` so migrations can be generated without a running
    // database or a configured connection string. Never used at runtime.
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<DataContext>
    {
        public DataContext CreateDbContext(string[] args)
        {
            var options = new DbContextOptionsBuilder<DataContext>()
                .UseMySql("server=localhost;database=cataris;user=root", DataContext.ServerVersion)
                .Options;

            return new DataContext(options);
        }
    }
}
