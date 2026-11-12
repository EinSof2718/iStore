using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Exam_Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Exam_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatsController : ControllerBase
    {
        private readonly Exam_BackendContext _context;

        public StatsController(Exam_BackendContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var totalRevenue = await _context.Orders.SumAsync(o=>o.TotalAmount);
            var totalProducts = await _context.Products.CountAsync();
            var totalUsers = await _context.Users.CountAsync();

            var topProducts = await _context.OrderItems.GroupBy(i => i.ProductId).Select(g => new
            {
                productId = g.Key,
                totalSold = g.Sum(i => i.CountProduct),
                totalRevenue = g.Sum(i => i.Price * i.CountProduct),
            }).OrderByDescending(x => x.totalSold).Take(10).ToListAsync();


            var productsIds = topProducts.Select(x=>x.productId).ToList();
            var productNames = await _context.Products.Where(p=>productsIds.Contains(p.ProductId)).ToDictionaryAsync(p=>p.ProductId, p=>p.Name);


            var topProductsRes = topProducts.Select(x => new
            {
                x.productId,
                name = productNames.GetValueOrDefault(x.productId, "Неизвестный товар"),
                x.totalSold,
                x.totalRevenue,
            });


            var topBuyers = await _context.Orders.GroupBy(o => o.UserId).Select(g => new
            {
                userId = g.Key,
                orderCount = g.Count(),
                totalSpent = g.Sum(o=>o.TotalAmount),
                customerName = g.First().CustomerName,
                customerEmail = g.First().CustomerEmail,
            }).OrderByDescending(x => x.orderCount).Take(10).ToListAsync();



            var monthlyStats = await _context.Orders.Where(o => o.OrderDate >= DateTime.UtcNow.AddMonths(-12)).GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month }).Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                orders = g.Count(),
                revenue = g.Sum(o=>o.TotalAmount),
            }).OrderBy(x=>x.year).ThenBy(x=>x.month).ToListAsync();


            var statusStats = await _context.Orders.GroupBy(o => o.StatusOrder).Select(g => new
            {
                status = g.Key,
                count = g.Count(),
            }).ToListAsync();



            var deliveryStats = await _context.Orders.GroupBy(o => o.DeliveryMethod).Select(g => new
            {
                method = g.Key,
                count = g.Count()
            }).ToListAsync();


            var categoryStats = await _context.OrderItems.Join(_context.Products, oi=>oi.ProductId, p=>p.ProductId, (oi,p) => new {oi,p}).Join(_context.Categories, x=>x.p.CategoryId, c=>c.CategoryId, (x,c)=>new { x.oi, c }).GroupBy(x => x.c.Name).Select(g => new
            {
                category = g.Key,
                totalSold = g.Sum(x=>x.oi.CountProduct),
                revenue = g.Sum(x=>x.oi.Price * x.oi.CountProduct),
            }).OrderByDescending(x=>x.totalSold).ToListAsync();


            return Ok(new
            {
                summary = new
                {
                    totalOrders,
                    totalRevenue,
                    totalProducts,
                    totalUsers,
                    avgOrderValue = totalOrders>0 ? totalRevenue/totalOrders : 0,
                },
                topProducts = topProductsRes,
                topBuyers,
                monthlyStats,
                statusStats,
                deliveryStats,
                categoryStats,
            });
        }
    }
}
