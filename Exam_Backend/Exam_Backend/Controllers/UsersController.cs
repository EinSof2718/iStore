using Exam_Backend.Areas.Identity.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Exam_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<Exam_BackendUser> _userManager;
        private readonly ILogger<UsersController> _logger;

        public UsersController(UserManager<Exam_BackendUser> userManager, ILogger<UsersController> logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = _userManager.Users.ToList();
                var res = new List<object>();

                foreach (var user in users)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    res.Add(new
                    {
                        id = user.Id,
                        email = user.Email,
                        fullName = user.FullName,
                        phoneNumber = user.PhoneNumber,
                        roles,
                        isManager = user.isManager
                    });
                }

                return Ok(new { success = true, users = res });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка получения пользователей");
                return StatusCode(500, new { success = false, error = "Внутренняя ошибка сервера" });
            }
        }

        // POST: api/Users
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest model)
        {
            try
            {
                if (await _userManager.FindByEmailAsync(model.Email) != null)
                    return BadRequest(new { success = false, error = "Пользователь с таким email уже существует" });

                var user = new Exam_BackendUser
                {
                    UserName = model.Email,
                    Email = model.Email,
                    FullName = model.FullName,
                    PhoneNumber = model.PhoneNumber,
                    isManager = model.Role == "Manager"
                };

                var result = await _userManager.CreateAsync(user, model.Password);
                if (!result.Succeeded)
                    return BadRequest(new { success = false, error = string.Join(", ", result.Errors.Select(e => e.Description)) });

                if (!string.IsNullOrWhiteSpace(model.Role))
                    await _userManager.AddToRoleAsync(user, model.Role);

                var roles = await _userManager.GetRolesAsync(user);
                return Ok(new
                {
                    success = true,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        fullName = user.FullName,
                        phoneNumber = user.PhoneNumber,
                        roles,
                        isManager = user.isManager
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка создания пользователя");
                return StatusCode(500, new { success = false, error = "Внутренняя ошибка сервера" });
            }
        }

        // PUT: api/Users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateUserRequest model)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return NotFound(new { success = false, error = "Пользователь не найден" });

                user.FullName = model.FullName;
                user.PhoneNumber = model.PhoneNumber;
                user.isManager = model.Role == "Manager";

                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                    return BadRequest(new { success = false, error = string.Join(", ", updateResult.Errors.Select(e => e.Description)) });

                if (!string.IsNullOrWhiteSpace(model.Role))
                {
                    var currentRoles = await _userManager.GetRolesAsync(user);
                    await _userManager.RemoveFromRolesAsync(user, currentRoles);
                    await _userManager.AddToRoleAsync(user, model.Role);
                }

                if (!string.IsNullOrWhiteSpace(model.Password))
                {
                    var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                    var passResult = await _userManager.ResetPasswordAsync(user, token, model.Password);
                    if (!passResult.Succeeded)
                        return BadRequest(new { success = false, error = string.Join(", ", passResult.Errors.Select(e => e.Description)) });
                }

                var roles = await _userManager.GetRolesAsync(user);
                return Ok(new
                {
                    success = true,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        fullName = user.FullName,
                        phoneNumber = user.PhoneNumber,
                        roles,
                        isManager = user.isManager
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка обновления пользователя");
                return StatusCode(500, new { success = false, error = "Внутренняя ошибка сервера" });
            }
        }

        // DELETE: api/Users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return NotFound(new { success = false, error = "Пользователь не найден" });

                var currentUserId = _userManager.GetUserId(User);
                if (user.Id == currentUserId)
                    return BadRequest(new { success = false, error = "Нельзя удалить собственный аккаунт" });

                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                    return BadRequest(new { success = false, error = string.Join(", ", result.Errors.Select(e => e.Description)) });

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка удаления пользователя");
                return StatusCode(500, new { success = false, error = "Внутренняя ошибка сервера" });
            }
        }
    }

    // Модели названы с суффиксом Request чтобы не конфликтовать с существующими моделями
    public class CreateUserRequest
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
    }

    public class UpdateUserRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
        public string? Password { get; set; }
    }
}