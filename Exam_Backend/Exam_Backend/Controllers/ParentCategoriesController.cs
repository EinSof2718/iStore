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
    public class ParentCategoriesController : ControllerBase
    {
        private readonly Exam_BackendContext _context;

        public ParentCategoriesController(Exam_BackendContext context)
        {
            _context = context;
        }

        // GET: api/ParentCategories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ParentCategory>>> GetParentCategories()
        {
            return await _context.ParentCategories.ToListAsync();
        }

        // GET: api/ParentCategories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ParentCategory>> GetParentCategory(int id)
        {
            var parentCategory = await _context.ParentCategories.FindAsync(id);

            if (parentCategory == null)
            {
                return NotFound();
            }

            return parentCategory;
        }

        // PUT: api/ParentCategories/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutParentCategory(int id, ParentCategory parentCategory)
        {
            if (id != parentCategory.ParentCategoryId)
            {
                return BadRequest();
            }

            _context.Entry(parentCategory).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ParentCategoryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/ParentCategories
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ParentCategory>> PostParentCategory(ParentCategory parentCategory)
        {
            _context.ParentCategories.Add(parentCategory);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetParentCategory", new { id = parentCategory.ParentCategoryId }, parentCategory);
        }

        // DELETE: api/ParentCategories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParentCategory(int id)
        {
            var parentCategory = await _context.ParentCategories.FindAsync(id);
            if (parentCategory == null)
            {
                return NotFound();
            }

            _context.ParentCategories.Remove(parentCategory);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ParentCategoryExists(int id)
        {
            return _context.ParentCategories.Any(e => e.ParentCategoryId == id);
        }
    }

}
