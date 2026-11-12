namespace Exam_Backend.Models
{
    public class PhotosProduct
    {
        public int PhotosProductId { get; set; }
        public int ProductId { get; set; }
        public string UrlPhoto { get; set; }
        public bool MainPhoto { get; set; }
        public string MediaType { get; set; } = "image";//image or video
    }
}
