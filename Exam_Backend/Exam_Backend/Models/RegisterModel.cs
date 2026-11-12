using System.ComponentModel.DataAnnotations;

namespace Exam_Backend.Models
{
    public class RegisterModel
    {
        [Required(ErrorMessage = "Имя обязательно")]
        [MaxLength(100, ErrorMessage = "Имя не должно превышать 100 символов")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email обязательно")]
        [EmailAddress(ErrorMessage = "Некорректный формат email")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Пароль обязателен")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Пароль должен содержать от 6 до 100 символов")]
        public string Password { get; set; } = string.Empty;

        [Compare("Password", ErrorMessage = "Пароли не совпадают")]
        public string ConfirmPassword { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }

    }
}
