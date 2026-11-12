using Exam_Backend.Data;
using Exam_Backend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exam_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BasketsController : ControllerBase
    {
        private readonly Exam_BackendContext _context;

        public BasketsController(Exam_BackendContext context)
        {
            _context = context;
        }

        // GET: api/Baskets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Basket>>> GetBasket()
        {
            return await _context.Baskets.ToListAsync();
        }

        // GET: api/Baskets/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Basket>>> GetBasketByUser(string userId)
        {
            try
            {
                var baskets = await _context.Baskets
                    .Where(b => b.UserId == userId)
                    .ToListAsync();

                Console.WriteLine($"Found {baskets.Count} baskets for user {userId}");

                if (!baskets.Any())
                {
                    return Ok(new List<Basket>());
                }

                return Ok(baskets);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetBasketByUser: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/Baskets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Basket>> GetBasket(int id)
        {
            var basket = await _context.Baskets.FindAsync(id);

            if (basket == null)
            {
                return NotFound();
            }

            return basket;
        }

        // PUT: api/Baskets/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBasket(int id, Basket basket)
        {
            if (id != basket.BasketId)
            {
                return BadRequest("ID в URL не совпадает с ID в теле запроса");
            }

            try
            {
                // Способ 1: Используем AsNoTracking для избежания конфликтов отслеживания
                var existingBasket = await _context.Baskets
                    .AsNoTracking()
                    .FirstOrDefaultAsync(b => b.BasketId == id);

                if (existingBasket == null)
                {
                    return NotFound($"Корзина с ID {id} не найдена");
                }

                // Проверяем, что пользователь обновляет свою корзину
                if (existingBasket.UserId != basket.UserId)
                {
                    return Unauthorized("Вы не можете изменять корзину другого пользователя");
                }

                // Устанавливаем дату обновления
                basket.DateAdded = DateTime.UtcNow;

                // Обновляем сущность
                _context.Entry(basket).State = EntityState.Modified;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BasketExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in PutBasket: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Альтернативный метод PUT: Обновление только количества
        [HttpPut("{id}/countProduct")]
        public async Task<IActionResult> UpdateQuantity(int id, [FromBody] UpdateCountProductRequest request)
        {
            try
            {
                // Находим существующую запись
                var basket = await _context.Baskets.FindAsync(id);

                if (basket == null)
                {
                    return NotFound($"Корзина с ID {id} не найдена");
                }

                // Обновляем только количество и дату
                basket.CountProduct = request.CountProduct;
                basket.DateAdded = DateTime.UtcNow;

                // Сохраняем изменения
                await _context.SaveChangesAsync();

                return Ok(basket);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateQuantity: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/Baskets
        [HttpPost]
        public async Task<ActionResult<Basket>> PostBasket(Basket basket)
        {
            try
            {
                // Проверяем, нет ли уже этого товара в корзине пользователя
                var existingBasket = await _context.Baskets
                    .FirstOrDefaultAsync(b => b.UserId == basket.UserId && b.ProductId == basket.ProductId);

                if (existingBasket != null)
                {
                    // Если товар уже есть, увеличиваем количество
                    existingBasket.CountProduct += basket.CountProduct;
                    existingBasket.DateAdded = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    return Ok(existingBasket);
                }

                // Устанавливаем дату добавления
                basket.DateAdded = DateTime.UtcNow;

                _context.Baskets.Add(basket);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetBasket", new { id = basket.BasketId }, basket);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in PostBasket: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/Baskets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBasket(int id)
        {
            try
            {
                var basket = await _context.Baskets.FindAsync(id);
                if (basket == null)
                {
                    return NotFound();
                }

                _context.Baskets.Remove(basket);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteBasket: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private bool BasketExists(int id)
        {
            return _context.Baskets.Any(e => e.BasketId == id);
        }
    }

    // Класс для запроса обновления количества
    public class UpdateCountProductRequest
    {
        public int CountProduct { get; set; }
    }
}