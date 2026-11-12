using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Exam_Backend.Data;
using Exam_Backend.Models;
using Microsoft.IdentityModel.Tokens;

namespace Exam_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly Exam_BackendContext _context;

        public ProductsController(Exam_BackendContext context)
        {
            _context = context;
        }

        // GET: api/Products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
            int? categoryId = null,
            string? search = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            string sortBy = "name",
            bool sortDescending = false,
            int page = 1,
            int pageSize = 12)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrEmpty(search))
                query = query.Where(p => p.Name.Contains(search));

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);


            if (sortBy?.ToLower() == "price-asc")
                query = query.OrderBy(p => p.Price);
            else query = query.OrderByDescending(p => p.Price);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Select(p => new
            {
                p.ProductId,
                p.Name,
                p.Price,
                p.BrandId,
                p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : null,
                p.Photos,
                p.CntReviews,
                p.Specifications
            }).ToListAsync();

            return Ok(new
            {
                items,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }//GetProducts



        // GET: api/Products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
                return NotFound();

            return product;
        }

        // PUT: api/Products/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.ProductId)
                return BadRequest();


            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // POST: api/Products
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProduct", new { id = product.ProductId }, product);
        }


        [HttpGet("{id}/similar")]
        public async Task<ActionResult<IEnumerable<object>>> GetSimilarProducts(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if(product == null) return NotFound(new {error = "Товар не найден"});

            var similar = await _context.Products.Where(p=>p.ProductId!=id && (p.CategoryId==product.CategoryId  || p.BrandId==product.BrandId))
            .OrderByDescending(p=>(p.CategoryId==product.CategoryId ? 3:0) + (p.BrandId == product.BrandId ? 2 : 0)).ThenBy(p=>Math.Abs((p.Price ?? 0) - (product.Price ?? 0)))
            .Take(8).Select(p => new
            {
                p.ProductId,
                p.Name,
                p.Price,
                p.Photos,
            }).ToListAsync();

            return Ok(similar);
        }//GetSimilarProducts

        // DELETE: api/Products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.ProductId == id);
        }
    }
}
