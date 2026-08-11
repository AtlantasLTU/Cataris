using System.ComponentModel.DataAnnotations;

namespace API.Models.ViewModels
{
    public class WagerViewModel
    {
        [Required(ErrorMessage = "Wager is required")]
        public string Wager { get; set; } = string.Empty;

        [Required(ErrorMessage = "Outcome is required")]
        [RegularExpression("^(win|loss)$", ErrorMessage = "Outcome must be 'win' or 'loss'")]
        public string Outcome { get; set; } = string.Empty;
    }
}
