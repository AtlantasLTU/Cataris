using System.ComponentModel.DataAnnotations;

namespace API.Models.ViewModels
{
    public class UpdateUserViewModel
    {
        [StringLength(32, MinimumLength = 3, ErrorMessage = "The {0} must be between {2} and {1} characters long")]
        public string? Username { get; set; }

        [EmailAddress]
        public string? Email { get; set; }
    }
}
