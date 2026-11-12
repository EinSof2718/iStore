namespace Exam_Backend.Models
{
    public class ReviewReplyDto
    {
        public int ReviewId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string Text { get; set; }

        public int? ParentReplyId { get; set; }
    }
}
