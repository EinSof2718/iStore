namespace Exam_Backend.Models
{
    public class PhotosReview
    {
        public int PhotosReviewId { get; set; }
        public int ReviewId { get; set; }
        public string UrlPhoto { get; set; }
        public string MediaType { get; set; } = "image"; //image or video
    }
}
