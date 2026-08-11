using API.Models;
using API.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace API.Controllers
{
    [Authorize]
    [Route("api/wallet")]
    [ApiController]
    public class WalletController : ControllerBase
    {
        private readonly UserManager<ApplicationUsers> _userManager;

        public WalletController(UserManager<ApplicationUsers> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("balance")]
        public async Task<ActionResult> Balance()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { error = "User no longer exists" });
            }

            // The front-end reads response.data directly as the balance.
            return Ok(user.Balance);
        }

        // NOTE: this trusts the client to report the outcome and the stake, which means
        // anyone can POST {"wager":"1000000","outcome":"win"} and credit themselves.
        // The guards below only stop impossible values; they do not make this safe.
        // The real fix is to run the game server-side and have it return the outcome.
        [HttpPost("wager")]
        public async Task<ActionResult> Wager([FromBody] WagerViewModel model)
        {
            if (!decimal.TryParse(model.Wager, NumberStyles.Number, CultureInfo.InvariantCulture, out var amount))
            {
                return BadRequest(new { error = "Wager must be a number" });
            }
            if (amount <= 0)
            {
                return BadRequest(new { error = "Wager must be greater than zero" });
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { error = "User no longer exists" });
            }

            if (model.Outcome == "loss")
            {
                if (user.Balance < amount)
                {
                    return BadRequest(new { error = "Insufficient balance" });
                }
                user.Balance -= amount;
            }
            else
            {
                user.Balance += amount;
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { error = string.Join(" ", result.Errors.Select(e => e.Description)) });
            }

            return Ok(new { balance = user.Balance });
        }
    }
}
