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
    public class SpecificationsProductsController : ControllerBase
    {
        private readonly Exam_BackendContext _context;

        public SpecificationsProductsController(Exam_BackendContext context)
        {
            _context = context;
        }

        // GET: api/SpecificationsProducts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SpecificationsProduct>>> GetSpecificationsProduct()
        {
            return await _context.SpecificationsProducts.ToListAsync();
        }

        [HttpGet("colors")]
        public async Task<IActionResult> GetColors([FromQuery] int? categoryId)
        {
            var colorKeys = new[] { "color", "цвет" };
            var query = _context.SpecificationsProducts.Where(s => colorKeys.Contains(s.SpecificationsKey.ToLower()));

            if (categoryId.HasValue)
                query = query.Where(s => _context.Products.Any(p => p.ProductId == s.ProductId && p.CategoryId == categoryId.Value));

            var colors = await query.Select(s => s.SpecificationsValue).Distinct().OrderBy(c => c).ToListAsync();
            return Ok(colors);
        }//GetColors


        [HttpGet("filterColor")]
        public async Task<IActionResult> FilterByColor([FromQuery] string? color, [FromQuery] int? categoryId)
        {
            if (string.IsNullOrWhiteSpace(color))
                return BadRequest(new { error = "Параметр color обязателен" });

            var colorKeys = new[] { "color", "цвет" };
            var query = _context.SpecificationsProducts.Where(s => colorKeys.Contains(s.SpecificationsKey.ToLower()) && s.SpecificationsValue.ToLower() == color.ToLower());

            if (categoryId.HasValue)
                query = query.Where(s => _context.Products.Any(p => p.ProductId == s.ProductId && p.CategoryId == categoryId.Value));


            var productIds = await query.Select(s => s.ProductId).Distinct().ToListAsync();
            return Ok(productIds);
        }//FilterByColor


        [HttpGet("storage")]
        public async Task<IActionResult> GetStorage([FromQuery] int? categoryId)
        {
            var storageKeys = new[] { "storage", "memory", "объём памяти", "объем памяти", "память" };
            var query = _context.SpecificationsProducts.Where(s => storageKeys.Contains(s.SpecificationsKey.ToLower()));

            if (categoryId.HasValue)
                query = query.Where(s => _context.Products.Any(p => p.ProductId == s.ProductId && p.CategoryId == categoryId.Value));

            var colors = await query.Select(s => s.SpecificationsValue).Distinct().OrderBy(c => c).ToListAsync();
            return Ok(colors);
        }//GetStorage

        [HttpGet("filterStorage")]
        public async Task<IActionResult> FilterByStorage([FromQuery] string? storage, [FromQuery] int? categoryId)
        {
            if (string.IsNullOrWhiteSpace(storage))
                return BadRequest(new { error = "Параметр storage обязателен" });

            var storageKeys = new[] { "storage", "memory", "объём памяти", "объем памяти", "память" };
            var query = _context.SpecificationsProducts.Where(s => storageKeys.Contains(s.SpecificationsKey.ToLower()) && s.SpecificationsValue.ToLower() == storage.ToLower());

            if (categoryId.HasValue)
                query = query.Where(s => _context.Products.Any(p => p.ProductId == s.ProductId && p.CategoryId == categoryId.Value));


            var productIds = await query.Select(s => s.ProductId).Distinct().ToListAsync();
            return Ok(productIds);
        }//FilterByStorage


        [HttpGet("filters")]
        public async Task<IActionResult> GetFilters([FromQuery] int? categoryId)
        {
            var colorKeys = new[] { "color", "цвет" };
            var storageKeys = new[] { "storage", "memory", "объём памяти", "объем памяти", "память" };

            IQueryable<SpecificationsProduct> baseQuery = _context.SpecificationsProducts;

            if (categoryId.HasValue)
                baseQuery = baseQuery.Where(s => _context.Products.Any(p => p.ProductId == s.ProductId && p.CategoryId == categoryId.Value));

            var allSpec = await baseQuery.ToListAsync();

            var colors = allSpec.Where(s => colorKeys.Contains(s.SpecificationsKey.ToLower())).Select(s => s.SpecificationsValue).Distinct().OrderBy(c => c).ToList();
            var storages = allSpec.Where(s => storageKeys.Contains(s.SpecificationsKey.ToLower())).Select(s => s.SpecificationsValue).Distinct().OrderBy(c => c).ToList();


            return Ok(new { colors, storages });
        }


        // GET: api/SpecificationsProducts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SpecificationsProduct>> GetSpecificationsProduct(int id)
        {
            var specificationsProduct = await _context.SpecificationsProducts.FindAsync(id);

            if (specificationsProduct == null)
            {
                return NotFound();
            }

            return specificationsProduct;
        }

        // PUT: api/SpecificationsProducts/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSpecificationsProduct(int id, [FromBody] SpecificationsProduct specificationsProduct)
        {
            if (id != specificationsProduct.SpecificationsProductId)
            {
                return BadRequest();
            }

            _context.Entry(specificationsProduct).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SpecificationsProductExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }//PutSpecificationsProduct

        // POST: api/SpecificationsProducts
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SpecificationsProduct>> PostSpecificationsProduct([FromBody] SpecificationsProduct specificationsProduct)
        {
           if(!ModelState.IsValid)
                return BadRequest(ModelState);
            var product = await _context.Products.FindAsync(specificationsProduct.ProductId);
            if (product == null)
                return NotFound(new { error = "Товар не найден" });

            _context.SpecificationsProducts.Add(specificationsProduct);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByProductId), new { productId = specificationsProduct.ProductId }, specificationsProduct);
        }//PostSpecificationsProduct


        //POST /api/ProductSpecs/bulk
        [HttpPost("bulk")]
        // Сохранить сразу весь набор характеристик для товара
        // (удаляет старые и записывает новые — удобно для страницы редактирования)
        public async Task<IActionResult> BulkSave([FromBody] BulkSaveDto dto)
        {
            if(dto.ProductId <0 || dto.Specifications == null)
                return BadRequest(new { error = "Некорректные данные" });

            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
                return NotFound(new { error = "Товар не найден" });

            var oldSpec = await _context.SpecificationsProducts.Where(s => s.ProductId == dto.ProductId).ToListAsync();
            _context.SpecificationsProducts.RemoveRange(oldSpec);

            int order = 0;
            foreach(var item in dto.Specifications)
            {
                if (string.IsNullOrWhiteSpace(item.SpecificationsKey) || string.IsNullOrWhiteSpace(item.SpecificationsValue))
                    continue;
                _context.SpecificationsProducts.Add(new SpecificationsProduct
                {
                    ProductId = dto.ProductId,
                    SpecificationsKey = item.SpecificationsKey.Trim(),
                    SpecificationsValue = item.SpecificationsValue.Trim(),
                    SortOrder = order++
                });
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Характеристики сохранены", count = order });
        }//BulkSave



        // DELETE: api/SpecificationsProducts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpecificationsProduct(int id)
        {
            var specificationsProduct = await _context.SpecificationsProducts.FindAsync(id);
            if (specificationsProduct == null)
            {
                return NotFound();
            }

            _context.SpecificationsProducts.Remove(specificationsProduct);
            await _context.SaveChangesAsync();

            return NoContent();
        }//DeleteSpecificationsProduct

        private bool SpecificationsProductExists(int id)
        {
            return _context.SpecificationsProducts.Any(e => e.SpecificationsProductId == id);
        }//SpecificationsProductExists



        // GET: api/SpecificationsProducts/product/5
        // Поиск по ProductId, а не по первичному ключу записи
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetByProductId(int productId)
        {
            var spec = await _context.SpecificationsProducts.Where(s => s.ProductId == productId).OrderBy(s => s.SortOrder).ThenBy(s => s.SpecificationsProductId).ToListAsync();
           
            return Ok(spec);
        }//GetByProductId
    }


    public class BulkSaveDto
    {
        public int ProductId { get; set; }
        public List<SpecificationsItem> Specifications { get; set; } = new();
    }

    public class SpecificationsItem
    {
        public string SpecificationsKey { get; set; } = string.Empty;
        public string SpecificationsValue { get; set; } = string.Empty;
    }
}
