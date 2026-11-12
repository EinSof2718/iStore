namespace Exam_Backend.Models
{
    public class Review
    {
        public int ReviewId { get; set; }
        public int ProductId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public int CntStars { get; set; }
        public string Description { get; set; }
        public DateTime? CreatedDate { get; set; }

        public bool? isApproved { get; set; } = null;
        public string? RejectionReason { get; set; }
    }
}
