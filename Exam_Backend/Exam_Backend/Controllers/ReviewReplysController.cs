using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Exam_Backend.Models;
using Exam_Backend.Data;


namespace Exam_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewReplysController : ControllerBase
    {
        private readonly Exam_BackendContext _context;

        string[] ManagerRoles = { "Admin", "Manager", "Moderator" };
        public ReviewReplysController(Exam_BackendContext context)
        {
            _context = context;
        }

        // GET: api/ReviewReplies/review/{reviewId}
        [HttpGet("review/{reviewId}")]
        public async Task<IActionResult> GetByReview(int reviewId)
        {
            var replies = await _context.ReviewReplys.Where(r=>r.ReviewId == reviewId).OrderBy(r=>r.CreateDate).Select(r=> new
            {
                r.ReplyId,
                r.ReviewId,
                r.UserId,
                r.UserName,
                r.Text,
                r.CreateDate,
                r.IsManager,
                r.ParentReplyId,
            }).ToListAsync();

            return Ok(replies);
        }//GetByReview

        // GET api/ReviewReplies/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var reviewIds = await _context.Reviews.Where(r => r.ProductId == productId).Select(r => r.ReviewId).ToListAsync();

            var replies = await _context.ReviewReplys.Where(r => reviewIds.Contains(r.ReviewId)).OrderBy(r => r.CreateDate).Select(r => new
            {
                r.ReplyId,
                r.ReviewId,
                r.UserId,
                r.UserName,
                r.Text,
                r.CreateDate,
                r.IsManager,
            }).ToListAsync();

            return Ok(replies);
        }//GetByProduct

        // POST api/ReviewReplies
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ReviewReplyDto replyDto)
        {
            if(string.IsNullOrWhiteSpace(replyDto.Text))
                return BadRequest(new { error = "Текст ответа обязателен" });

            var review = await _context.Reviews.FindAsync(replyDto.ReviewId);
            if (review == null)
                return NotFound(new { error = "Отзыв не найден" });

            if(replyDto.ParentReplyId.HasValue)
            {
                var parentExists = await _context.ReviewReplys.AnyAsync(r=>r.ReplyId == replyDto.ParentReplyId.Value && r.ReviewId==replyDto.ReviewId);

                if (!parentExists)
                    return BadRequest(new { error = "Родительский ответ не найден" });
            }//if

            var user = await _context.Users.FindAsync(replyDto.UserId);
            bool isManager = false;
            if(user != null)
            {
                var roles = await _context.UserRoles.Where(ur=>ur.UserId==replyDto.UserId).Join(_context.Roles, ur=>ur.RoleId, r=>r.Id, (ur, r)=>r.Name).ToListAsync();
                isManager = roles.Any(r => ManagerRoles.Contains(r));
            }//if

            var reply = new ReviewReply
            {
                ReviewId = replyDto.ReviewId,
                UserId = replyDto.UserId,
                UserName = replyDto.UserName,
                Text = replyDto.Text,
                CreateDate = DateTime.UtcNow,
                IsManager = isManager,
                ParentReplyId = replyDto.ParentReplyId,
            };

            _context.ReviewReplys.Add(reply);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByReview), new { reviewId = replyDto.ReviewId }, new
            {
                reply.ReplyId,
                reply.ReviewId,
                reply.UserId,
                reply.UserName,
                reply.Text,
                reply.CreateDate,
                reply.IsManager,
                reply.ParentReplyId,
            });
        }//Post


        // DELETE api/ReviewReplies/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] string userId)
        {
            var reply = await _context.ReviewReplys.FindAsync(id);
            if (reply == null)
                return NotFound();

            var user = await _context.Users.FindAsync(userId);
            bool isManager = false;
            if (user != null)
            {
                var roles = await _context.UserRoles.Where(ur => ur.UserId == userId).Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name).ToListAsync();
                isManager = roles.Any(r => ManagerRoles.Contains(r));
            }//if

            if (reply.UserId != userId && !isManager)
                return StatusCode(403, new { error = "Нет прав для удаления" });

            _context.ReviewReplys.Remove(reply);
            await _context.SaveChangesAsync();
            return NoContent();
        }//Delete
    }
}
