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
    public class PhotosProductsController : ControllerBase
    {
        private readonly Exam_BackendContext _context;

        public PhotosProductsController(Exam_BackendContext context)
        {
            _context = context;
        }

        // GET: api/PhotosProducts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PhotosProduct>>> GetPhotosProduct()
        {
            return await _context.PhotosProducts.ToListAsync();
        }

        // GET: api/PhotosProducts/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<PhotosProduct>>> GetPhotosByProductId(int productId)
        {
            var photos = await _context.PhotosProducts.Where(p => p.ProductId == productId).ToListAsync();

            if (photos == null || photos.Count == 0)
                return NotFound($"Фотографии/видео для продукта с ID {productId} не найдены");

            return Ok(photos);
        }

        // PUT: api/PhotosProducts/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPhotosProduct(int id, PhotosProduct photosProduct)
        {
            if (id != photosProduct.PhotosProductId)
                return BadRequest();


            _context.Entry(photosProduct).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PhotosProductExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // POST: api/PhotosProducts
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<PhotosProduct>> PostPhotosProduct(PhotosProduct photosProduct)
        {
            var extension = Path.GetExtension(photosProduct.UrlPhoto).ToLower();
            var videoExtensions = new[]{".mp4", ".mkv", ".webm", ".avi", ".mov"};
            if (videoExtensions.Contains(extension))
                photosProduct.MediaType = "video";
            else
                photosProduct.MediaType = "image";
    
            _context.PhotosProducts.Add(photosProduct);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPhotosProduct", new { id = photosProduct.PhotosProductId }, photosProduct);
        }



        // DELETE: api/PhotosProducts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhotosProduct(int id)
        {
            var photosProduct = await _context.PhotosProducts.FindAsync(id);
            if (photosProduct == null) return NotFound();
                
            _context.PhotosProducts.Remove(photosProduct);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PhotosProductExists(int id)
        {
            return _context.PhotosProducts.Any(e => e.PhotosProductId == id);
        }



        // PUT: api/PhotosProducts/{id}/set-main
        [HttpPut("{id}/set-main")]
        public async Task<IActionResult> SetMainPhoto(int id)
        {
            var photo = await _context.PhotosProducts.FindAsync(id);
            if (photo == null)
                return NotFound(new { error = "Фотография не найдена" });


            // Сбрасываем MainPhoto для всех фото этого продукта
            var productPhotos = await _context.PhotosProducts.Where(p => p.ProductId == photo.ProductId).ToListAsync();

            foreach (var p in productPhotos)
                p.MainPhoto = (p.PhotosProductId == id);


            await _context.SaveChangesAsync();

            return Ok(new { message = "Главная фотография обновлена" });
        }
    }
}
