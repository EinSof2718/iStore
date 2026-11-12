namespace Exam_Backend.Models
{
    public class Basket
    {
        public int BasketId { get; set; }
        public string UserId { get; set; }
        public int ProductId { get; set; }
        public int CountProduct { get; set; }
        public int AmountBasket { get; set; }
        public DateTime DateAdded { get; set; }
    }
}
