namespace Exam_Backend.Models
{
    public class ParentCategory
    {
        public int ParentCategoryId {get; set;}

        public string Name { get; set; }

        public ICollection<Category> Categories { get; set; } = new List<Category>();
    }
}
