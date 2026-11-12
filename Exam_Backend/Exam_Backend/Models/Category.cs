namespace Exam_Backend.Models
{
    public class Category
    {
        public int CategoryId { get; set; }
        public int BrandId { get; set; }
        public string Name { get; set; }


        public int ParentCategoryId { get; set; }

        public ParentCategory ParentCategory { get; set; }
        public ICollection<Product> Products { get; set; }
    }
}
