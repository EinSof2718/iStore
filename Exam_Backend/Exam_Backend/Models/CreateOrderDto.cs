using System.ComponentModel.DataAnnotations;

namespace Exam_Backend.Models
{

    public class CreateOrderDto
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        [Required]
        [MaxLength(100)]
        public string CustomerName { get; set; }

        [Required]
        [EmailAddress]
        public string CustomerEmail { get; set; }

        [Required]
        [Phone]
        public string CustomerPhone { get; set; }

        [Required]
        [MaxLength(100)]
        public string DeliveryAddress { get; set; }

        [MaxLength(50)]
        public string DeliveryMethod { get; set; }

        [Range(0, double.MaxValue)]
        public decimal DeliveryCost { get; set; }

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; }

        [MaxLength(200)]
        public string PaymentStatus { get; set; }

        public string Comments { get; set; }

        [Required]
        [MinLength(1)]
        public List<CreateOrderItemDto> Items { get; set; } = new();
    }

    public class CreateOrderItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int CountProduct { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
    }
}
