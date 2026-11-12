namespace Exam_Backend.Models
{
    public class Product
    {
        public int ProductId { get; set; }
        public int BrandId { get; set; }

        public int CategoryId { get; set; }

        public string? Name { get; set; }

        public int? Price { get; set; }

        public string? Specifications { get; set; }

        public string? Photos { get; set; }

        public virtual Category? Category { get; set; }

        public int CntReviews {  get; set; }
        public ICollection<Review>? Reviews { get; set; }
    }
}
