using Exam_Backend.Data;
using Exam_Backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Exam_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhotosReviewController : ControllerBase
    {
        private readonly Exam_BackendContext _context;

        public PhotosReviewController(Exam_BackendContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PhotosReview>>> GetPhotosReview()
        {
            return await _context.PhotosReviews.ToListAsync();
        }//GetPhotosReviw


        [HttpGet("review/{reviewId}")]
        public async Task<ActionResult<IEnumerable<PhotosReview>>> GetPhotosByReviewId(int reviewId)
        {
            var photos = await _context.PhotosReviews.Where(r => r.ReviewId == reviewId).ToListAsync();

            if (photos == null || photos.Count == 0)
                return NotFound($"Фотографии/видео для отзыва с ID {reviewId} не найдены");

            return Ok(photos);
        }//GetPhotosByRevieId


        [HttpPut("{id}")]
        public async Task<IActionResult> PutPhotosReview(int id, PhotosReview photosReview)
        {
            if (id != photosReview.PhotosReviewId)
                return BadRequest();

            _context.Entry(photosReview).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PhotosReviewExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }


        [HttpPost("upload")]
        public async Task<IActionResult> PostPhotosReview(IFormFile file, [FromQuery] int reviewId)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "Файл не выбран" });

            var extension = Path.GetExtension(file.FileName).ToLower();
            var extensionImg = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extensionVideo = new[] { ".mp4", ".webm", ".mov" };
            var allExtension = extensionImg.Concat(extensionVideo).ToArray();

            if(!allExtension.Contains(extension))
                return BadRequest(new { error = "Недопустимый формат файла" });

            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "reviews"); 
            Directory.CreateDirectory(folder);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(folder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var mediaType = extensionVideo.Contains(extension) ? "video" : "image";
            var url = $"/reviews/{fileName}";

            var photo = new PhotosReview
            {
                ReviewId = reviewId,
                UrlPhoto = url,
                MediaType = mediaType,
            };

            _context.PhotosReviews.Add(photo);
            await _context.SaveChangesAsync();

            return Ok(new { url, mediaType, photosReviewId = photo.PhotosReviewId });
        }//PostPhotosReview



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhotosReview(int id)
        {
            var photosReview = await _context.PhotosReviews.FindAsync(id);
            if (photosReview == null) return NotFound();

            _context.PhotosReviews.Remove(photosReview);
            await _context.SaveChangesAsync();

            return NoContent();
        }



        private bool PhotosReviewExists(int id)
        {
            return _context.PhotosReviews.Any(e=>e.PhotosReviewId==id);
        }
    }
}
