using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Exam_Backend.Data;
using Exam_Backend.Models;

namespace Exam_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly Exam_BackendContext _context;

        public ReviewsController(Exam_BackendContext context)
        {
            _context = context;
        }

        // GET: api/Reviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews()
        {
            return await _context.Reviews.ToListAsync();
        }


        //GET: api/Reviews/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAllReviews([FromQuery] string? status = null)
        {
            var query = _context.Reviews.AsQueryable();

            query = status switch
            {
                "pending" => query.Where(r => r.isApproved == null),
                "approved" => query.Where(r => r.isApproved == true),
                "rejected" => query.Where(r => r.isApproved == false),
                _ => query
            };

            var reviews = await query.OrderByDescending(r => r.CreatedDate).Select(r => new
            {
                r.ReviewId,
                r.ProductId,
                r.UserId,
                r.UserName,
                Rating = r.CntStars,
                Description = r.Description,
                CreatedDate = r.CreatedDate ?? DateTime.Now,
                r.isApproved,
                r.RejectionReason,
            }).ToListAsync();

            return Ok(new { reviews, totalCount = reviews.Count });
        }


        // GET: api/Reviews/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);

            if (review == null)
                return NotFound();

            return review;
        }


        // GET: api/Reviews/product/5
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetReviewsByProduct(int productId)
        {
            /*var reviews = await _context.Reviews.Where(r => r.ProductId == productId && r.isApproved == true).OrderByDescending(r => r.ProductId).Select(r => new
            {
                r.ReviewId,
                r.ProductId,
                r.UserId,
                r.UserName,
                Rating = r.CntStars,
                Description = r.Description,
                CreatedDate = r.CreatedDate ?? DateTime.Now,
                Photos = _context.PhotosReviews.Where(p => p.ReviewId == r.ReviewId).Select(p => new
                {
                    p.PhotosReviewId,
                    p.UrlPhoto,
                    p.MediaType,
                }).ToList(),
            }).ToListAsync();

            if (reviews == null || reviews.Count == 0)
                return Ok(new List<object>());

            return Ok(reviews);*/


            var reviews = await _context.Reviews.Where(r => r.ProductId == productId && r.isApproved == true).OrderByDescending(r => r.CreatedDate).ToListAsync();
            if(reviews.Count == 0)
                return Ok(new List<object>());

            var reviewsIds = reviews.Select(r=>r.ReviewId).ToList();

            var allPhotos = await _context.PhotosReviews.Where(p=>reviewsIds.Contains(p.ReviewId)).ToListAsync();

            var res = reviews.Select(r => new
            {

                r.ReviewId,
                r.ProductId,
                r.UserId,
                r.UserName,
                Rating = r.CntStars,
                Description = r.Description,
                CreatedDate = r.CreatedDate ?? DateTime.Now,
                Photos = allPhotos.Where(p => p.ReviewId == r.ReviewId).Select(p => new
                {
                    p.PhotosReviewId,
                    p.UrlPhoto,
                    p.MediaType,
                }).ToList(),
            }).ToList();

            return Ok(res);
        }



        //GET: api/Reviews/moderation
        [HttpGet("moderation")]
        public async Task<IActionResult> GetPendingReviews()
        {
        var reviews = await _context.Reviews.Where(r => r.isApproved == null).OrderBy(r => r.CreatedDate).Select(r => new
        {
            r.ReviewId,
            r.ProductId,
            r.UserId,
            r.UserName,
            Rating = r.CntStars,
            Description = r.Description,
            CreatedDate = r.CreatedDate ?? DateTime.Now,
            r.isApproved,
            r.RejectionReason,
        }).ToListAsync();

        return Ok(new {reviews, totalCount = reviews.Count });
        }




        //PUT: api/Reviews/{id}/approve
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();

            review.isApproved = true;
            review.RejectionReason = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Отзыв добавлен" });
        }

        //PUT: api/Reviews/{id}/reject
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> Reject(int id, [FromBody] RejectDto dto)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();

            review.isApproved = false;
            review.RejectionReason = dto.Reason ?? "Не соответсвует правилам";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Отзыв отклонён" });
        }

        //PUT: api/Reviews/{id}/reset
        [HttpPut("{id}/reset")]
        public async Task<IActionResult> Reset(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();

            review.isApproved = null;
            review.RejectionReason = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Отзыв возвращён на модерацию" });
        }

        // POST: api/Reviews
        [HttpPost]
        public async Task<ActionResult<IEnumerable<object>>> PostReview([FromBody] ReviewDto reviewDto)
        {
            if (reviewDto == null)
                return BadRequest("Данные отзыва не предоставлены");

            if (string.IsNullOrWhiteSpace(reviewDto.Description))
                return BadRequest("Текст отзыва обязателен");

            if (reviewDto.CntStars < 1 || reviewDto.CntStars > 5)
                return BadRequest("Рейтинг должен быть от 1 до 5");

            var hasCompleteOrder = await _context.Orders.AnyAsync(o => o.UserId == reviewDto.UserId && (o.StatusOrder == "Выполнен" || o.StatusOrder == "completed" || o.StatusOrder == "Завершен" || o.StatusOrder == "Доставлен") && o.Items.Any(i => i.ProductId == reviewDto.ProductId));


            if (!hasCompleteOrder)
                return BadRequest("Вы можете оставлять отзыв на товар, только после его покупки");

            var review = new Review
            {
                ProductId = reviewDto.ProductId,
                UserId = reviewDto.UserId,
                UserName = reviewDto.UserName,
                CntStars = reviewDto.CntStars,
                Description = reviewDto.Description,
                CreatedDate = DateTime.UtcNow,
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReview), new { id = review.ReviewId }, review);
        }


        // PUT: api/Reviews/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReview(int id, [FromBody] ReviewDto reviewDto)
        {
            var review = await _context.Reviews.FindAsync(id);
            if(review == null)
                return NotFound();

            if(review.UserId != reviewDto.UserId)
                return Forbid("Вы можете редактировать только свои отзывы");

            review.UserName = reviewDto.UserName;
            review.CntStars = reviewDto.CntStars;
            review.Description = reviewDto.Description;
            review.CreatedDate = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReviewExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();

        }


        // DELETE: api/Reviews/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound();
            }


            var productId = review.ProductId;

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        private bool ReviewExists(int id)
        {
            return _context.Reviews.Any(e => e.ReviewId == id);
        }


        }

        public class RejectDto
        {
            public string? Reason {  get; set; }
        }

        }
