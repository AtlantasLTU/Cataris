using API.Interfaces;
using API.Models;
using API.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserManager<ApplicationUsers> _userManager;
        private readonly SignInManager<ApplicationUsers> _signInManager;
        private readonly ITokenService _tokenService;

        public UserController(UserManager<ApplicationUsers> userManager, SignInManager<ApplicationUsers> signInManager, ITokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginViewModels model)
        {
            var user = await _userManager.FindByNameAsync(model.Username);
            if (user == null)
            {
                return Unauthorized(new { error = "Wrong login credentials" });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded)
            {
                return Unauthorized(new { error = "Wrong login credentials" });
            }

            // The front-end stores response.data straight into localStorage as the token,
            // so this returns the bare JWT rather than wrapping it in an object.
            return Ok(_tokenService.createToken(user));
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterViewModel model)
        {
            if (await _userManager.Users.AnyAsync(u => u.UserName == model.Username))
            {
                return BadRequest(new { error = "Username already taken" });
            }
            if (await _userManager.Users.AnyAsync(u => u.Email == model.Email))
            {
                return BadRequest(new { error = "Email already registered" });
            }

            var user = new ApplicationUsers
            {
                UserName = model.Username,
                Email = model.Email,
                Name = model.Username,
                Balance = 0m
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                return BadRequest(new { error = string.Join(" ", result.Errors.Select(e => e.Description)) });
            }
            await _userManager.AddToRoleAsync(user, Utility.Helper.User);

            // The front-end checks for 201 specifically before treating registration as successful.
            return StatusCode(StatusCodes.Status201Created, new { message = "User successfully registered." });
        }

        [Authorize]
        [HttpGet("user_info")]
        public async Task<ActionResult> UserInfo()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { error = "User no longer exists" });
            }

            return Ok(new
            {
                username = user.UserName,
                email = user.Email,
                balance = user.Balance
            });
        }

        [Authorize]
        [HttpPost("update_user")]
        public async Task<ActionResult> UpdateUser([FromBody] UpdateUserViewModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { error = "User no longer exists" });
            }

            if (!string.IsNullOrWhiteSpace(model.Username) && model.Username != user.UserName)
            {
                if (await _userManager.Users.AnyAsync(u => u.UserName == model.Username))
                {
                    return BadRequest(new { error = "Username already taken" });
                }
                var renamed = await _userManager.SetUserNameAsync(user, model.Username);
                if (!renamed.Succeeded)
                {
                    return BadRequest(new { error = string.Join(" ", renamed.Errors.Select(e => e.Description)) });
                }
                user.Name = model.Username;
            }

            if (!string.IsNullOrWhiteSpace(model.Email) && model.Email != user.Email)
            {
                if (await _userManager.Users.AnyAsync(u => u.Email == model.Email))
                {
                    return BadRequest(new { error = "Email already registered" });
                }
                var changed = await _userManager.SetEmailAsync(user, model.Email);
                if (!changed.Succeeded)
                {
                    return BadRequest(new { error = string.Join(" ", changed.Errors.Select(e => e.Description)) });
                }
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { error = string.Join(" ", result.Errors.Select(e => e.Description)) });
            }

            return Ok(new { message = "User updated successfully" });
        }
    }
}
