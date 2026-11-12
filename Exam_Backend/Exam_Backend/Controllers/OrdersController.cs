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
    public class OrdersController : ControllerBase
    {
        private readonly Exam_BackendContext _context;

        public OrdersController(Exam_BackendContext context)
        {
            _context = context;
        }

        // GET: api/Orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrder()
        {
            return await _context.Orders.ToListAsync();
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetOrder(int id)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.Items)
                    .FirstOrDefaultAsync(o => o.OrderId == id);

                if (order == null)
                {
                    return NotFound(new { success = false, error = "Заказ не найден" });
                }

                // Создаем DTO для избежания циклических ссылок
                var orderDto = new
                {
                    order.OrderId,
                    order.NumberOrder,
                    order.StatusOrder,
                    order.TotalAmount,
                    order.OrderDate,
                    order.CustomerName,
                    order.CustomerEmail,
                    order.CustomerPhone,
                    order.DeliveryAddress,
                    order.DeliveryMethod,
                    order.DeliveryCost,
                    order.PaymentMethod,
                    order.PaymentStatus,
                    order.Comments,
                    order.UserId,
                    Items = order.Items.Select(item => new
                    {
                        item.Id,
                        item.ProductId,
                        item.CountProduct,
                        item.Price,
                    }).ToList()
                };

                return Ok(new
                {
                    success = true,
                    order = orderDto
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при получении заказа {id}: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Внутренняя ошибка сервера",
                    details = ex.Message
                });
            }
        }

        // PUT: api/Orders/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, Order order)
        {
            if (id != order.OrderId)
            {
                return BadRequest();
            }

            _context.Entry(order).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
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

        // POST: api/Orders
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Order>> PostOrder([FromBody] CreateOrderDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                });
            }

            try
            {
                // Проверка пользователя
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == dto.UserId);

                if (user == null)
                {
                    return NotFound(new { success = false, error = "Пользователь не найден" });
                }

                // Проверка продуктов
                var productIds = dto.Items.Select(i => i.ProductId).ToList();
                var existingProducts = await _context.Products
                    .Where(p => productIds.Contains(p.ProductId))
                    .ToDictionaryAsync(p => p.ProductId);

                foreach (var item in dto.Items)
                {
                    if (!existingProducts.ContainsKey(item.ProductId))
                    {
                        return BadRequest(new
                        {
                            success = false,
                            error = $"Товар с ID {item.ProductId} не найден"
                        });
                    }
                }

                Random random = new Random();

                // Создание заказа
                var order = new Order
                {
                    UserId = dto.UserId,
                    NumberOrder = random.Next(1000, 999999),
                    StatusOrder = "pending",
                    TotalAmount = dto.TotalAmount,
                    OrderDate = DateTime.UtcNow,
                    CustomerName = dto.CustomerName,
                    CustomerEmail = dto.CustomerEmail,
                    CustomerPhone = dto.CustomerPhone,
                    DeliveryAddress = dto.DeliveryAddress,
                    DeliveryMethod = dto.DeliveryMethod,
                    DeliveryCost = dto.DeliveryCost,
                    PaymentMethod = dto.PaymentMethod,
                    PaymentStatus = dto.PaymentStatus ?? (dto.PaymentMethod == "cash" ? "Ожидает оплаты" : "Оплачен"),
                    Comments = dto.Comments ?? string.Empty,
                    Items = new List<OrderItem>()
                };

                // Добавление товаров
                foreach (var itemDto in dto.Items)
                {
                    order.Items.Add(new OrderItem
                    {
                        ProductId = itemDto.ProductId,
                        CountProduct = itemDto.CountProduct,
                        Price = itemDto.Price
                    });
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, new
                {
                    success = true,
                    orderId = order.OrderId,
                    numberOrder = order.NumberOrder,
                    message = "Заказ успешно создан"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка создания заказа: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Внутренняя ошибка сервера"
                });
            }
        }

        // DELETE: api/Orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
        }


        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetUserOrders(string userId)
        {
            try
            {
                Console.WriteLine($"=== GetUserOrders called for userId: {userId} ===");
        
                // Проверяем, существует ли пользователь
                var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
                Console.WriteLine($"User exists: {userExists}");
        
                // Получаем количество заказов
                var ordersCount = await _context.Orders
                    .Where(o => o.UserId == userId)
                    .CountAsync();
                Console.WriteLine($"Total orders found: {ordersCount}");
        
                var orders = await _context.Orders
                    .Include(o=>o.Items)
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.OrderDate)
                    .Select(o => new
                    {
                        o.OrderId,
                        o.NumberOrder,
                        o.StatusOrder,
                        o.TotalAmount,
                        o.OrderDate,
                        o.DeliveryMethod,
                        o.PaymentMethod,
                        o.PaymentStatus,
                        ItemsCount = o.Items.Count
                    })
                    .ToListAsync();

                Console.WriteLine($"Orders retrieved: {orders.Count}");
        
                return Ok(new
                {
                    success = true,
                    orders = orders
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== ERROR in GetUserOrders ===");
                Console.WriteLine($"Message: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
        
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
        
                return StatusCode(500, new 
                { 
                    success = false, 
                    error = "Ошибка при загрузке заказов",
                    details = ex.Message
                });
            }
        }    
    }
}
