using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Exam_Backend.Models
{
    public class Order
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public string UserId { get; set; }  // Внешний ключ на пользователя


        [Range(1, int.MaxValue)]
        public int NumberOrder { get; set; }  // Номер заказа (уникальный)

        [Required]
        [MaxLength(50)]
        public string StatusOrder { get; set; }  // Или используйте enum: OrderStatus

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }  // Общая сумма с копейками

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;  // Дата создания

        // Контактная информация покупателя
        [Required]
        [MaxLength(100)]
        public string CustomerName { get; set; }

        [Required]
        [EmailAddress]
        public string CustomerEmail { get; set; }

        [Required]
        [Phone]
        public string CustomerPhone { get; set; }

        // Адрес доставки
        [Required]
        [MaxLength(100)]
        public string DeliveryAddress { get; set; }

        [MaxLength(50)]
        public string DeliveryMethod { get; set; }  // Например: "Курьер", "Самовывоз"

        [Column(TypeName = "decimal(18,2)")]
        public decimal DeliveryCost { get; set; } = 0;  // Стоимость доставки

        // Способ оплаты
        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; }  // Например: "Карта", "Наличные"

        [MaxLength(200)]
        public string PaymentStatus { get; set; } = "Ожидает оплаты";  // Например: "Оплачен", "Отменён"

        // Комментарии к заказу
        public string Comments { get; set; }

        // Список товаров в заказе
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
