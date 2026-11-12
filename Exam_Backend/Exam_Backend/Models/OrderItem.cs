using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Exam_Backend.Models
{
    public class OrderItem
    {
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }  // Внешний ключ на товар

        [Required]
        [Range(1, int.MaxValue)]
        public int CountProduct { get; set; }  // Количество

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }  // Цена за единицу

        // Связь с заказом
        public int OrderId { get; set; }
        public Order Order { get; set; }

        public Product Product { get; set; }
    }
}
