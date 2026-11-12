namespace Exam_Backend.Models
{
    public class ReviewDto
    {
        public int ProductId { get; set; }
        public string UserId { get; set; }

        public string UserName { get; set; }
        public int CntStars { get; set; }
        public string Description { get; set; }
    }
}
