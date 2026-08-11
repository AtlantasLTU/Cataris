using System.ComponentModel.DataAnnotations;

namespace API.Models.ViewModels
{
    public class RegisterViewModel
    {
        [Required(ErrorMessage = "Username is required")]
        [StringLength(32, MinimumLength = 3, ErrorMessage = "The {0} must be between {2} and {1} characters long")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [StringLength(40, MinimumLength = 8, ErrorMessage = "The {0} must be at least {2} characters long")]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Confirm Password is required")]
        [DataType(DataType.Password)]
        [Display(Name = "Confirm Password")]
        [Compare("Password", ErrorMessage = "Password does not match")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
