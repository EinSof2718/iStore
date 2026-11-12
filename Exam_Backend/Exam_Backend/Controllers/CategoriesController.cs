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
    public class CategoriesController : ControllerBase
    {
        private readonly Exam_BackendContext _context;

        public CategoriesController(Exam_BackendContext context)
        {
            _context = context;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategory()
        {
            var categories = await _context.Categories.Select(c => new
            {
                c.CategoryId,
                c.Name,
                c.BrandId,
                c.ParentCategoryId,
                ParentCategoryName = c.ParentCategory != null ? c.ParentCategory.Name : null,
            }).ToListAsync();

            return Ok(categories);
        }

        

        // PUT: api/Categories/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, CategoryDto categoryDto)
        {
            var category = await _context.Categories.FindAsync(id);
            if(category == null) return NotFound();

            category.Name = categoryDto.Name;
            category.BrandId = categoryDto.BrandId;
            category.ParentCategoryId = categoryDto.ParentCategoryId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/Categories
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(CategoryDto categoryDto)
        {
            var parentCategory = await _context.ParentCategories.FirstOrDefaultAsync(pc => pc.ParentCategoryId == categoryDto.ParentCategoryId);
            if (parentCategory == null) return BadRequest(new { error = "Родительская категория не найдена" });

            var category = new Category
            {
                Name = categoryDto.Name,
                BrandId = categoryDto.BrandId,
                ParentCategoryId = categoryDto.ParentCategoryId,
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            var createdCategory = await _context.Categories.Where(c => c.CategoryId == category.CategoryId).Select(c => new
            {
                c.CategoryId,
                c.Name,
                c.BrandId,
                c.ParentCategoryId,
                ParentCategoryName = c.ParentCategory != null ? c.ParentCategory.Name : null,
            }).FirstOrDefaultAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryId }, createdCategory);


        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.CategoryId == id);
        }


        //GET: api/Categories/tree
        [HttpGet("tree")]
        public async Task<ActionResult> GetTree()
        {
            var parents = await _context.ParentCategories.OrderBy(p => p.Name).ToListAsync();

            var categories = await _context.Categories.Select(c => new
            {
                c.CategoryId,
                c.Name,
                c.ParentCategoryId,
                ProductCnt = _context.Products.Count(p => p.CategoryId == c.CategoryId)
            }).OrderBy(c => c.Name).ToListAsync();

            var tree = parents.Select(parent => new
            {
                parentCategoryId = parent.ParentCategoryId,
                name = parent.Name,
                children = categories.Where(c => c.ParentCategoryId == parent.ParentCategoryId).Select(c => new
                {
                    categoryId = c.CategoryId,
                    name = c.Name,
                    parentCategoryId = c.ParentCategoryId,
                    productCnt = c.ProductCnt
                }).ToList()
            });

            return Ok(tree);
        }



        //GET: api/Categories/parents
        [HttpGet("parents")]
        public async Task<ActionResult> GetParentCategoriesWithChildren()
        {
            var parents = await _context.ParentCategories.OrderBy(p => p.Name).Select(p => new
            {
                p.ParentCategoryId,
                p.Name,
                children = _context.Categories.Where(c => c.ParentCategoryId == p.ParentCategoryId).OrderBy(c => c.Name).Select(c => new { c.CategoryId, c.Name, c.BrandId }).ToList()
            }).ToListAsync();;

            return Ok(parents);
        }




        // GET: api/Categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories.Where(c => c.CategoryId == id).Select(c => new
            {
                c.CategoryId,
                c.Name,
                c.BrandId,
                c.ParentCategoryId,
                ParentCategoryName = c.ParentCategory != null ? c.ParentCategory.Name : null,
            }).FirstOrDefaultAsync();

            if (category == null) return NotFound();
            return Ok(category);
        }



        //GET: api/Categories/{id}/products
        [HttpGet("{id}/products")]
        public async Task<IActionResult> GetProducts(int id, int page = 1, int pageSize = 12)
        {
            var category = await _context.Categories.FindAsync(id);
            if(category == null) return NotFound();

            var query = _context.Products.Where(p => p.CategoryId == id);
            var totalCnt = await query.CountAsync();

            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).Select(p => new
            {
                p.ProductId,
                p.Name,
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
                totalCnt,
                page,
                pageSize,
                totalPage = (int)Math.Ceiling((double)totalCnt/pageSize)
            });
        }

    }


    public class CategoryDto
    {
        public string Name {  get; set; }
        public int BrandId { get; set; }
        public int ParentCategoryId { get; set; }
    }

}
