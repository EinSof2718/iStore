using Exam_Backend.Areas.Identity.Data;
using Exam_Backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Exam_Backend.Areas.Identity.Pages.Account;
using Microsoft.AspNetCore.Authorization;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using LoginModel = Exam_Backend.Models.LoginModel;

namespace Exam_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<Exam_BackendUser> _userManager;
        private readonly SignInManager<Exam_BackendUser> _signInManager;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<Exam_BackendUser> userManager,
            SignInManager<Exam_BackendUser> signInManager,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _logger = logger;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(Models.RegisterModel model)
        {
            try
            {
                _logger.LogInformation($"Registration attempt for: {model.Email}");

                // Проверка валидации
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    _logger.LogWarning($"Validation errors: {string.Join(", ", errors)}");
                    return BadRequest(new { Success = false, Errors = errors });
                }

                // Проверка существования пользователя
                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null)
                {
                    _logger.LogWarning($"User already exists: {model.Email}");
                    return BadRequest(new
                    {
                        Success = false,
                        Error = "Пользователь с таким email уже существует"
                    });
                }

                // Создание пользователя
                var user = new Exam_BackendUser
                {
                    UserName = model.Email,
                    Email = model.Email,
                    FullName = model.FullName,
                    PhoneNumber = model.PhoneNumber,
                    EmailConfirmed = true, // Для упрощения разработки
                };

                // Создание пользователя с паролем
                var result = await _userManager.CreateAsync(user, model.Password);

                if (result.Succeeded)
                {
                    _logger.LogInformation($"User created successfully: {model.Email}");

                    // Добавляем роль "Customer" по умолчанию
                    await _userManager.AddToRoleAsync(user, "User");

                    // Возвращаем информацию о пользователе
                    return Ok(new
                    {
                        Success = true,
                        Message = "Пользователь успешно зарегистрирован",
                        User = new
                        {
                            Id = user.Id,
                            Email = user.Email,
                            FullName = user.FullName,
                            PhoneNumber = user.PhoneNumber,
                            Roles = new List<string> { "User" }
                        }
                    });
                }
                else
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    _logger.LogError($"Create user failed: {string.Join(", ", errors)}");
                    return BadRequest(new
                    {
                        Success = false,
                        Errors = errors
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Registration error for {model.Email}");
                return StatusCode(500, new
                {
                    Success = false,
                    Error = "Внутренняя ошибка сервера",
                    Details = ex.Message
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            try
            {
                _logger.LogInformation($"API Login attempt for: {model.Email}");

                // Используем тот же метод, что и в Razor Page
                var result = await _signInManager.PasswordSignInAsync(
                    model.Email,
                    model.Password,
                    isPersistent: true,
                    lockoutOnFailure: false
                );

                if (result.Succeeded)
                {
                    var user = await _userManager.FindByEmailAsync(model.Email);
                    var roles = await _userManager.GetRolesAsync(user);

                    _logger.LogInformation($"API Login successful for: {model.Email}");

                    await _signInManager.SignInAsync(user, isPersistent: true);

                    // Проверяем куку
                    var cookieHeader = Response.Headers["Set-Cookie"].ToString();
                    _logger.LogInformation($"Set-Cookie header: {cookieHeader}");

                    return Ok(new
                    {
                        Success = true,
                        User = new
                        {
                            user.Id,
                            user.Email,
                            user.FullName,
                            user.PhoneNumber,
                            Roles = roles,
                            IsManager = user.isManager
                        }
                    });
                }

                if (result.IsLockedOut)
                {
                    return Unauthorized(new { Success = false, Error = "Аккаунт заблокирован" });
                }

                return Unauthorized(new { Success = false, Error = "Неверный email или пароль" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"API Login error for {model.Email}");
                return StatusCode(500, new { Success = false, Error = "Внутренняя ошибка сервера" });
            }
        }


        // GET: api/Auth/me
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Unauthorized(new
                    {
                        Success = false,
                        Error = "Пользователь не авторизован"
                    });
                }

                var roles = await _userManager.GetRolesAsync(user);

                return Ok(new
                {
                    Success = true,
                    User = new
                    {
                        Id = user.Id,
                        Email = user.Email,
                        FullName = user.FullName,
                        PhoneNumber = user.PhoneNumber,
                        Roles = roles,
                        IsManager = user.isManager,
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get current user error");
                return StatusCode(500, new
                {
                    Success = false,
                    Error = "Внутренняя ошибка сервера"
                });
            }
        }


        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                    return Unauthorized(new { Success = false, Error = "Пользователь не найден" });
                return Ok(new
                {
                    Success = true,
                    User = new
                    {
                        Id = user.Id,
                        Email = user.Email,
                        FullName = user.FullName,
                        PhoneNumber = user.PhoneNumber,
                        IsManager = user.isManager,
                        EmailConfirmed = user.EmailConfirmed
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка профиля");
                return StatusCode(500, new { Success = false, Error = "Внутренняя ошибка" });
            }//try-catch
        }//GetProfile


        [Authorize]
        [HttpPost("updateProfile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileModel model)
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                    return Unauthorized(new { Success = false, Error = "Пользователь не найден" });

                user.FullName = model.FullName;
                user.PhoneNumber = model.PhoneNumber;

                var res = await _userManager.UpdateAsync(user);

                if (res.Succeeded)
                {
                    return Ok(new
                    {
                        Success = true,
                        User = new
                        {
                            Id = user.Id,
                            Email = user.Email,
                            FullName = user.FullName,
                            PhoneNumber = user.PhoneNumber,
                            IsManager = user.isManager,
                        }
                    });
                }
                return BadRequest(new { Success = false, Errors = res.Errors.Select(e => e.Description) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка обновления профиля");
                return StatusCode(500, new { Success = false, Error = "Внутренняя ошибка" });
            }//try-catch
        }//UpdateProfile



        [HttpGet("check-cookie")]
        public IActionResult CheckCookie()
        {
            var cookies = Request.Cookies;
            var identityCookie = cookies[".AspNetCore.Identity.Application"];

            return Ok(new
            {
                Success = true,
                HasCookie = identityCookie != null,
                CookieValue = identityCookie != null ? identityCookie.Substring(0, Math.Min(20, identityCookie.Length)) + "..." : null,
                AllCookies = cookies.Keys.ToList(),
                IsAuthenticated = User.Identity?.IsAuthenticated ?? false,
                UserName = User.Identity?.Name
            });
        }



        [HttpGet("debug")]
        public IActionResult Debug()
        {
            return Ok(new
            {
                IsAuthenticated = User.Identity?.IsAuthenticated ?? false,
                UserName = User.Identity?.Name,
                AuthenticationType = User.Identity?.AuthenticationType,
                Cookies = Request.Cookies.Keys.ToList(),
                HasIdentityCookie = Request.Cookies.ContainsKey(".AspNetCore.Identity.Application"),
                Headers = Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())
            });
        }

    }
}
